// game/room.js
// In-memory game state manager. All game logic lives here.
// DB is only written at round end and game end.

const { generateGameQuestions } = require('./questions');
const { generateBotOrders } = require('./bots');
const { matchOrders, applyTrades } = require('./trading');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const ROUND_DURATION = 45000;  // 45 seconds
const LOG_DURATION   = 10000;  // 10 seconds between rounds
const DISCONNECT_GRACE = 22000; // 22 seconds hold before seat considered vacant
const MAX_PLAYERS = 6;
const TOTAL_ROUNDS = 6;

// rooms: Map<gameId, RoomState>
const rooms = new Map();

class RoomState {
  constructor(gameId, roomCode) {
    this.gameId = gameId;
    this.roomCode = roomCode;
    this.players = new Map(); // playerId -> PlayerState
    this.orders = [];         // current round orders
    this.currentRound = 1;
    this.phase = 'waiting';   // waiting | play | log | finished
    this.questions = [];
    this.hiddenArray = [];
    this.roundTimer = null;
    this.tradeLog = [];       // all rounds
    this.currentRoundTrades = [];
    this.pnlSaved = false;
  }

  get realPlayerCount() {
    return [...this.players.values()].filter(p => !p.isBot).length;
  }

  get allPlayers() {
    return [...this.players.values()];
  }

  get trueValue() {
    return this.hiddenArray.reduce((a, b) => a + b, 0);
  }
}

class PlayerState {
  constructor(playerId, userId, name, seatNumber, isBot = false, botName = null) {
    this.playerId = playerId;
    this.userId = userId;
    this.name = isBot ? botName : name;
    this.seatNumber = seatNumber;
    this.cash = 0;
    this.assetCount = 2;
    this.hasReceivedBonus = false;
    this.isBot = isBot;
    this.botName = botName;
    this.isConnected = true;
    this.disconnectTimer = null;
    this.socketId = null;
    this.roundsPlayed = 0;
    this.roundPnlHistory = []; // per round: { round, cashAfter, assetsAfter, roundPnl, cumulativePnl }
    this.ordersThisRound = []; // 'BID' | 'ASK'
  }
}

// ─── Room creation ────────────────────────────────────────────

async function createRoom() {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ room_code: roomCode })
    .select()
    .single();

  if (error) throw error;

  const room = new RoomState(data.id, roomCode);
  rooms.set(data.id, room);
  return room;
}

// ─── Matchmaking ──────────────────────────────────────────────

async function findOrCreateRoom() {
  // Look for a waiting room with < 6 real players
  for (const [, room] of rooms) {
    if (room.phase === 'waiting' && room.realPlayerCount < MAX_PLAYERS) {
      return room;
    }
  }
  return await createRoom();
}

async function addPlayerToRoom(room, userId, userName) {
  // Hard cap: never exceed 6 real players
  if (room.realPlayerCount >= MAX_PLAYERS) {
    return null;
  }

  // Check not already in room
  for (const p of room.players.values()) {
    if (p.userId === userId) return p;
  }

  const playerId = uuidv4();
  const seatNumber = room.realPlayerCount + 1;

  // Insert into DB
  const { error } = await supabase.from('players').insert({
    id: playerId,
    user_id: userId,
    game_id: room.gameId,
    seat_number: seatNumber,
    cash: 0,
    asset_count: 2,
    is_bot: false,
  });

  if (error) throw error;

  const player = new PlayerState(playerId, userId, userName, seatNumber);
  room.players.set(playerId, player);

  return player;
}

// ─── Game start ───────────────────────────────────────────────

async function startGame(room, io) {
  // Add 2 bots
  await addBots(room);

  // Generate questions
  const qData = generateGameQuestions();
  room.questions = qData.map(q => q.text);
  room.hiddenArray = qData.map(q => q.answer);
  room.phase = 'play';
  room.currentRound = 1;

  // Update DB
  await supabase.from('game_sessions').update({
    is_active: true,
    hidden_array: room.hiddenArray,
    ques_list: room.questions,
    current_round: 1,
    round_phase: 'play',
    round_start_time: new Date().toISOString(),
  }).eq('id', room.gameId);

  startRound(room, io);
}

async function addBots(room) {
  const botDefs = [
    { name: 'Bot 1', email: 'bot1@marketsmith.internal' },
    { name: 'Bot 2', email: 'bot2@marketsmith.internal' },
  ];

  for (let i = 0; i < 2; i++) {
    const botId = uuidv4();
    const seatNumber = MAX_PLAYERS + 1 + i;

    await supabase.from('players').insert({
      id: botId,
      user_id: null,
      game_id: room.gameId,
      seat_number: seatNumber,
      cash: 0,
      asset_count: 2,
      is_bot: true,
      bot_name: botDefs[i].name,
    });

    const bot = new PlayerState(botId, null, botDefs[i].name, seatNumber, true, botDefs[i].name);
    room.players.set(botId, bot);
  }
}

// ─── Round management ─────────────────────────────────────────

function startRound(room, io) {
  room.orders = [];
  room.currentRoundTrades = [];

  // Clear per-round order tracking for all players
  for (const p of room.players.values()) {
    p.ordersThisRound = [];
  }

  // Bonus asset from round 4 onwards
  if (room.currentRound >= 4) {
    for (const p of room.players.values()) {
      if (!p.hasReceivedBonus) {
        p.assetCount += 1;
        p.hasReceivedBonus = true;
      }
    }
  }

  // Emit round start to all players
  io.to(room.gameId).emit('round_started', {
    round: room.currentRound,
    totalRounds: TOTAL_ROUNDS,
    question: room.questions[room.currentRound - 1],
    duration: ROUND_DURATION / 1000,
    players: serializePlayers(room),
  });

  // Place bot orders after a short delay (0-5s)
  scheduleBotOrders(room, io);

  // End round after ROUND_DURATION
  room.roundTimer = setTimeout(() => endRound(room, io), ROUND_DURATION);
}

function scheduleBotOrders(room, io) {
  for (const p of room.players.values()) {
    if (!p.isBot) continue;

    const delay = Math.floor(Math.random() * 5000); // 0-5 seconds
    setTimeout(() => {
      if (room.phase !== 'play') return;
      const orders = generateBotOrders(room.trueValue, p.playerId, room.currentRound);
      room.orders.push(orders.bid);
      room.orders.push(orders.ask);
      p.ordersThisRound.push('BID', 'ASK');
    }, delay);
  }
}

async function endRound(room, io) {
  if (room.phase !== 'play') return;
  room.phase = 'log';

  // Match orders
  const trades = matchOrders(room.orders);

  // Build player state map for trade application
  const playerStateMap = new Map();
  for (const [id, p] of room.players) {
    playerStateMap.set(id, { cash: p.cash, assetCount: p.assetCount });
  }

  const executed = applyTrades(playerStateMap, trades);

  // Apply results back to room state
  for (const [id, p] of room.players) {
    const state = playerStateMap.get(id);
    if (state) {
      p.cash = state.cash;
      p.assetCount = state.assetCount;
    }
  }

  // Build trade log entries
  const roundTrades = executed.map(t => {
    const buyer = room.players.get(t.buyerId);
    const seller = room.players.get(t.sellerId);
    return {
      round: room.currentRound,
      buyer: buyer ? buyer.name : 'Unknown',
      seller: seller ? seller.name : 'Unknown',
      buyerIsBot: t.buyerIsBot,
      sellerIsBot: t.sellerIsBot,
      price: t.price,
    };
  });

  room.currentRoundTrades = roundTrades;
  room.tradeLog.push(...roundTrades);

  // Increment rounds played for connected non-bot players
  for (const p of room.players.values()) {
    if (!p.isBot) p.roundsPlayed += 1;
  }

  // Save round snapshot to DB
  await saveRoundSnapshot(room);

  // Save executed trades to DB
  await saveTransactions(room, executed);

  // Deactivate orders in DB
  await supabase.from('orders')
    .update({ is_active: false })
    .eq('game_id', room.gameId)
    .eq('round_number', room.currentRound);

  // Update game session in DB
  await supabase.from('game_sessions').update({
    current_round: room.currentRound,
    round_phase: 'log',
    last_trade_log: room.tradeLog,
    current_round_trades: roundTrades,
  }).eq('id', room.gameId);

  // Emit round end
  io.to(room.gameId).emit('round_ended', {
    round: room.currentRound,
    trades: roundTrades,
    players: serializePlayers(room),
    nextRoundIn: LOG_DURATION / 1000,
  });

  // Check if game over
  if (room.currentRound >= TOTAL_ROUNDS) {
    room.roundTimer = setTimeout(() => finishGame(room, io), LOG_DURATION);
  } else {
    room.roundTimer = setTimeout(() => {
      room.currentRound += 1;
      room.phase = 'play';
      startRound(room, io);
    }, LOG_DURATION);
  }
}

// ─── Game finish ──────────────────────────────────────────────

async function finishGame(room, io) {
  if (room.pnlSaved) return;
  room.pnlSaved = true;
  room.phase = 'finished';

  const trueValue = room.trueValue;

  // Calculate final PnL for each real player
  const results = [];
  for (const p of room.players.values()) {
    if (p.isBot) continue;
    const netPnl = p.cash + (p.assetCount - 3) * trueValue;
    results.push({ player: p, netPnl });

    // Update player record
    await supabase.from('players').update({
      cash: p.cash,
      asset_count: p.assetCount,
      net_pnl: netPnl,
      rounds_played: p.roundsPlayed,
    }).eq('id', p.playerId);

    // Update user total_pnl, games_played, best_game_pnl
    const { data: userData } = await supabase
      .from('users')
      .select('total_pnl, games_played, best_game_pnl')
      .eq('id', p.userId)
      .single();

    if (userData) {
      const newTotal = userData.total_pnl + netPnl;
      const newGames = userData.games_played + 1;
      const newBest = Math.max(userData.best_game_pnl, netPnl);
      await supabase.from('users').update({
        total_pnl: newTotal,
        games_played: newGames,
        best_game_pnl: newBest,
      }).eq('id', p.userId);
    }
  }

  // Mark game finished
  await supabase.from('game_sessions').update({
    is_finished: true,
    is_active: false,
    finished_at: new Date().toISOString(),
  }).eq('id', room.gameId);

  // Sort by PnL
  results.sort((a, b) => b.netPnl - a.netPnl);

  io.to(room.gameId).emit('game_over', {
    trueValue,
    hiddenArray: room.hiddenArray,
    players: results.map((r, i) => ({
      rank: i + 1,
      name: r.player.name,
      seat: r.player.seatNumber,
      cash: r.player.cash,
      assets: r.player.assetCount,
      netPnl: r.netPnl,
      roundsPlayed: r.player.roundsPlayed,
    })),
    gameId: room.gameId,
    roomCode: room.roomCode,
  });

  // Clean up room from memory after 2 minutes
  setTimeout(() => rooms.delete(room.gameId), 120000);
}

// ─── DB helpers ───────────────────────────────────────────────

async function saveRoundSnapshot(room) {
  const trueValue = room.trueValue;
  const snapshots = [];

  for (const p of room.players.values()) {
    if (p.isBot) continue;

    const cumulativePnl = p.cash + (p.assetCount - 3) * trueValue;
    const prev = p.roundPnlHistory[p.roundPnlHistory.length - 1];
    const prevCumulative = prev ? prev.cumulativePnl : 0;
    const roundPnl = cumulativePnl - prevCumulative;

    const snapshot = {
      round: room.currentRound,
      cashAfter: p.cash,
      assetsAfter: p.assetCount,
      roundPnl,
      cumulativePnl,
    };

    p.roundPnlHistory.push(snapshot);

    const tradesThisRound = room.currentRoundTrades.filter(
      t => t.buyer === p.name || t.seller === p.name
    ).length;

    snapshots.push({
      game_id: room.gameId,
      user_id: p.userId,
      player_id: p.playerId,
      round_number: room.currentRound,
      cash_after: p.cash,
      assets_after: p.assetCount,
      round_pnl: roundPnl,
      cumulative_pnl: cumulativePnl,
      trades_in_round: tradesThisRound,
      rounds_played_so_far: p.roundsPlayed,
      is_bot: false,
    });
  }

  if (snapshots.length > 0) {
    await supabase.from('round_snapshots').insert(snapshots);
  }
}

async function saveTransactions(room, executed) {
  if (executed.length === 0) return;

  const rows = executed.map(t => ({
    game_id: room.gameId,
    buyer_id: t.buyerId,
    seller_id: t.sellerId,
    price: t.price,
    round_number: room.currentRound,
  }));

  await supabase.from('transactions').insert(rows);
}

// ─── Order placement ──────────────────────────────────────────

function placeOrder(room, playerId, type, price) {
  const player = room.players.get(playerId);
  if (!player) return { ok: false, message: 'Player not found' };
  if (room.phase !== 'play') return { ok: false, message: 'Round is not active' };
  if (price < 1 || price > 100) return { ok: false, message: 'Price must be between 1 and 100' };

  // One of each type per round
  if (player.ordersThisRound.includes(type)) {
    return { ok: false, message: `Only ONE ${type === 'BID' ? 'BUY' : 'SELL'} order allowed per round` };
  }

  // Asset guard for sells
  if (type === 'ASK' && player.assetCount <= 1) {
    return { ok: false, message: 'You must keep at least 1 asset — cannot sell your last one' };
  }

  const order = {
    playerId,
    type,
    price,
    timestamp: Date.now(),
    isBot: player.isBot,
  };

  room.orders.push(order);
  player.ordersThisRound.push(type);

  // Save to DB async (non-blocking)
  supabase.from('orders').insert({
    player_id: playerId,
    game_id: room.gameId,
    order_type: type,
    price,
    round_number: room.currentRound,
    is_active: true,
  }).then(() => {}).catch(console.error);

  return { ok: true, message: `${type === 'BID' ? 'Buy' : 'Sell'} order placed at ${price}` };
}

// ─── Disconnect handling ──────────────────────────────────────

function handleDisconnect(room, playerId, io) {
  const player = room.players.get(playerId);
  if (!player || player.isBot) return;

  player.isConnected = false;
  player.disconnectTimer = setTimeout(() => {
    // After grace period, mark as permanently disconnected
    // Seat stays empty — no replacement
    io.to(room.gameId).emit('player_disconnected', {
      name: player.name,
      seat: player.seatNumber,
    });
  }, DISCONNECT_GRACE);
}

function handleReconnect(room, playerId, socketId) {
  const player = room.players.get(playerId);
  if (!player) return false;

  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }

  player.isConnected = true;
  player.socketId = socketId;
  return true;
}

// ─── Serialization ────────────────────────────────────────────

function serializePlayers(room) {
  return room.allPlayers.map(p => ({
    playerId: p.playerId,
    name: p.name,
    seat: p.seatNumber,
    cash: p.cash,
    assets: p.assetCount,
    isBot: p.isBot,
    isConnected: p.isConnected,
    roundsPlayed: p.roundsPlayed,
  }));
}

function getRoom(gameId) {
  return rooms.get(gameId) || null;
}

module.exports = {
  rooms,
  findOrCreateRoom,
  addPlayerToRoom,
  startGame,
  placeOrder,
  handleDisconnect,
  handleReconnect,
  getRoom,
  serializePlayers,
};
