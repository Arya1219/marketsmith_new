// api/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { adminAuthMiddleware } = require('../middleware/auth');
const room = require('../game/room');

const router = express.Router();

// ─── Admin login ──────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// ─── Leaderboard (full, with email) ──────────────────────────
router.get('/leaderboard', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, email, games_played, total_pnl, best_game_pnl')
      .order('total_pnl', { ascending: false });

    if (error) throw error;

    res.json({
      leaderboard: data.map((u, i) => ({
        rank: i + 1,
        name: u.first_name,
        email: u.email,
        gamesPlayed: u.games_played,
        totalPnl: u.total_pnl,
        bestGamePnl: u.best_game_pnl,
      })),
    });
  } catch (err) {
    console.error('Admin leaderboard error:', err);
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
});

// ─── All game sessions ────────────────────────────────────────
router.get('/games', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id, room_code, is_active, is_finished, is_void, hidden_array, current_round, created_at, finished_at, players(id)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const games = data.map(g => ({
      gameId: g.id,
      roomCode: g.room_code,
      status: g.is_void ? 'VOID' : g.is_finished ? 'FINISHED' : g.is_active ? 'ACTIVE' : 'WAITING',
      playerCount: (g.players || []).length,
      trueAssetValue: g.is_finished && g.hidden_array ? g.hidden_array.reduce((a, b) => a + b, 0) : null,
      startedAt: g.created_at,
      finishedAt: g.finished_at,
    }));

    res.json({ games });
  } catch (err) {
    console.error('Admin games error:', err);
    res.status(500).json({ error: 'Could not load game sessions' });
  }
});

// ─── Single game details ──────────────────────────────────────
router.get('/games/:gameId', adminAuthMiddleware, async (req, res) => {
  try {
    const { data: game, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', req.params.gameId)
      .single();

    if (error || !game) return res.status(404).json({ error: 'Game not found' });

    const { data: players } = await supabase
      .from('players')
      .select('*, users(first_name, email)')
      .eq('game_id', req.params.gameId);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, buyer:buyer_id(*), seller:seller_id(*)')
      .eq('game_id', req.params.gameId)
      .order('round_number', { ascending: true });

    const { data: snapshots } = await supabase
      .from('round_snapshots')
      .select('*, users(first_name)')
      .eq('game_id', req.params.gameId)
      .order('round_number', { ascending: true });

    res.json({
      game: {
        gameId: game.id,
        roomCode: game.room_code,
        status: game.is_void ? 'VOID' : game.is_finished ? 'FINISHED' : game.is_active ? 'ACTIVE' : 'WAITING',
        hiddenArray: game.hidden_array,
        trueAssetValue: game.hidden_array ? game.hidden_array.reduce((a, b) => a + b, 0) : null,
        currentRound: game.current_round,
        startedAt: game.created_at,
        finishedAt: game.finished_at,
      },
      players: (players || []).map(p => ({
        playerId: p.id,
        name: p.is_bot ? p.bot_name : (p.users ? p.users.first_name : 'Unknown'),
        email: p.is_bot ? null : (p.users ? p.users.email : null),
        seat: p.seat_number,
        cash: p.cash,
        assets: p.asset_count,
        netPnl: p.net_pnl,
        roundsPlayed: p.rounds_played,
        isBot: p.is_bot,
      })),
      roundBreakdown: (snapshots || []).map(s => ({
        round: s.round_number,
        playerName: s.users ? s.users.first_name : 'Unknown',
        cashAfter: s.cash_after,
        assetsAfter: s.assets_after,
        roundPnl: s.round_pnl,
        cumulativePnl: s.cumulative_pnl,
        tradesInRound: s.trades_in_round,
      })),
    });
  } catch (err) {
    console.error('Admin game detail error:', err);
    res.status(500).json({ error: 'Could not load game details' });
  }
});

// ─── Delete game ───────────────────────────────────────────────
router.delete('/games/:gameId', adminAuthMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('game_sessions')
      .delete()
      .eq('id', req.params.gameId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete game error:', err);
    res.status(500).json({ error: 'Could not delete game' });
  }
});

// ─── Mark game void (excluded from results, recalculates user PnL) ──
router.post('/games/:gameId/void', adminAuthMiddleware, async (req, res) => {
  try {
    const { data: game, error: gameErr } = await supabase
      .from('game_sessions')
      .select('is_void')
      .eq('id', req.params.gameId)
      .single();

    if (gameErr || !game) return res.status(404).json({ error: 'Game not found' });

    const makeVoid = !game.is_void;

    const { data: players } = await supabase
      .from('players')
      .select('user_id, net_pnl, is_bot')
      .eq('game_id', req.params.gameId)
      .eq('is_bot', false);

    // Adjust each user's total_pnl by removing/restoring this game's contribution
    for (const p of players || []) {
      if (!p.user_id) continue;
      const { data: user } = await supabase
        .from('users')
        .select('total_pnl, games_played')
        .eq('id', p.user_id)
        .single();

      if (!user) continue;

      const delta = makeVoid ? -p.net_pnl : p.net_pnl;
      const gamesDelta = makeVoid ? -1 : 1;

      await supabase.from('users').update({
        total_pnl: user.total_pnl + delta,
        games_played: Math.max(0, user.games_played + gamesDelta),
      }).eq('id', p.user_id);
    }

    await supabase.from('game_sessions').update({ is_void: makeVoid }).eq('id', req.params.gameId);

    res.json({ success: true, isVoid: makeVoid });
  } catch (err) {
    console.error('Admin void game error:', err);
    res.status(500).json({ error: 'Could not update void status' });
  }
});

// ─── Participants ──────────────────────────────────────────────
router.get('/participants', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, email, games_played, total_pnl, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      participants: data.map(u => ({
        id: u.id,
        name: u.first_name,
        email: u.email,
        gamesPlayed: u.games_played,
        totalPnl: u.total_pnl,
        joinedAt: u.created_at,
      })),
    });
  } catch (err) {
    console.error('Admin participants error:', err);
    res.status(500).json({ error: 'Could not load participants' });
  }
});

router.delete('/participants/:userId', adminAuthMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete participant error:', err);
    res.status(500).json({ error: 'Could not delete participant' });
  }
});

router.post('/participants/:userId/reset-password', adminAuthMiddleware, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('id', req.params.userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Admin reset password error:', err);
    res.status(500).json({ error: 'Could not reset password' });
  }
});

// ─── Live monitor ──────────────────────────────────────────────
router.get('/live', adminAuthMiddleware, async (req, res) => {
  try {
    let activeGames = 0;
    let waitingPlayers = 0;
    let activePlayers = 0;
    const gamesList = [];

    for (const [, r] of room.rooms) {
      if (r.phase === 'waiting') {
        waitingPlayers += r.realPlayerCount;
      } else if (r.phase !== 'finished') {
        activeGames += 1;
        activePlayers += r.realPlayerCount;
      }
      gamesList.push({
        gameId: r.gameId,
        roomCode: r.roomCode,
        phase: r.phase,
        playerCount: r.realPlayerCount,
        round: r.currentRound,
      });
    }

    res.json({
      activeGames,
      waitingPlayers,
      activePlayers,
      onlineTotal: waitingPlayers + activePlayers,
      games: gamesList,
    });
  } catch (err) {
    console.error('Admin live monitor error:', err);
    res.status(500).json({ error: 'Could not load live stats' });
  }
});

// ─── CSV Export helpers ────────────────────────────────────────
function toCsv(rows, headers) {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerRow = headers.map(h => escape(h.label)).join(',');
  const dataRows = rows.map(row => headers.map(h => escape(row[h.key])).join(','));
  return [headerRow, ...dataRows].join('\n');
}

router.get('/export/leaderboard', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name, email, games_played, total_pnl, best_game_pnl')
      .order('total_pnl', { ascending: false });

    if (error) throw error;

    const rows = data.map((u, i) => ({
      rank: i + 1,
      name: u.first_name,
      email: u.email,
      gamesPlayed: u.games_played,
      totalPnl: u.total_pnl,
      bestGamePnl: u.best_game_pnl,
    }));

    const csv = toCsv(rows, [
      { key: 'rank', label: 'Rank' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'gamesPlayed', label: 'Games Played' },
      { key: 'totalPnl', label: 'Total PnL' },
      { key: 'bestGamePnl', label: 'Best Game PnL' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leaderboard.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Export leaderboard error:', err);
    res.status(500).json({ error: 'Could not export leaderboard' });
  }
});

router.get('/export/games', adminAuthMiddleware, async (req, res) => {
  try {
    const { data: snapshots, error } = await supabase
      .from('round_snapshots')
      .select('*, users(first_name, email), game_sessions(room_code)')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = (snapshots || []).map(s => ({
      gameId: s.game_id,
      roomCode: s.game_sessions ? s.game_sessions.room_code : '',
      playerName: s.users ? s.users.first_name : 'Unknown',
      email: s.users ? s.users.email : '',
      round: s.round_number,
      cashAfter: s.cash_after,
      assetsAfter: s.assets_after,
      tradesInRound: s.trades_in_round,
      roundPnl: s.round_pnl,
      cumulativePnl: s.cumulative_pnl,
      roundsPlayedSoFar: s.rounds_played_so_far,
      date: s.created_at,
    }));

    const csv = toCsv(rows, [
      { key: 'gameId', label: 'Game ID' },
      { key: 'roomCode', label: 'Room Code' },
      { key: 'playerName', label: 'Player Name' },
      { key: 'email', label: 'Email' },
      { key: 'round', label: 'Round' },
      { key: 'cashAfter', label: 'Cash After Round' },
      { key: 'assetsAfter', label: 'Assets After Round' },
      { key: 'tradesInRound', label: 'Trades In Round' },
      { key: 'roundPnl', label: 'Round PnL' },
      { key: 'cumulativePnl', label: 'Cumulative PnL' },
      { key: 'roundsPlayedSoFar', label: 'Rounds Played So Far' },
      { key: 'date', label: 'Date' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="all_games_round_breakdown.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Export games error:', err);
    res.status(500).json({ error: 'Could not export game results' });
  }
});

router.get('/export/games/:gameId', adminAuthMiddleware, async (req, res) => {
  try {
    const { data: snapshots, error } = await supabase
      .from('round_snapshots')
      .select('*, users(first_name, email), game_sessions(room_code)')
      .eq('game_id', req.params.gameId)
      .order('round_number', { ascending: true });

    if (error) throw error;

    const rows = (snapshots || []).map(s => ({
      gameId: s.game_id,
      roomCode: s.game_sessions ? s.game_sessions.room_code : '',
      playerName: s.users ? s.users.first_name : 'Unknown',
      email: s.users ? s.users.email : '',
      round: s.round_number,
      cashAfter: s.cash_after,
      assetsAfter: s.assets_after,
      tradesInRound: s.trades_in_round,
      roundPnl: s.round_pnl,
      cumulativePnl: s.cumulative_pnl,
      roundsPlayedSoFar: s.rounds_played_so_far,
      date: s.created_at,
    }));

    const csv = toCsv(rows, [
      { key: 'gameId', label: 'Game ID' },
      { key: 'roomCode', label: 'Room Code' },
      { key: 'playerName', label: 'Player Name' },
      { key: 'email', label: 'Email' },
      { key: 'round', label: 'Round' },
      { key: 'cashAfter', label: 'Cash After Round' },
      { key: 'assetsAfter', label: 'Assets After Round' },
      { key: 'tradesInRound', label: 'Trades In Round' },
      { key: 'roundPnl', label: 'Round PnL' },
      { key: 'cumulativePnl', label: 'Cumulative PnL' },
      { key: 'roundsPlayedSoFar', label: 'Rounds Played So Far' },
      { key: 'date', label: 'Date' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="game_${req.params.gameId}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export single game error:', err);
    res.status(500).json({ error: 'Could not export game' });
  }
});

module.exports = router;
