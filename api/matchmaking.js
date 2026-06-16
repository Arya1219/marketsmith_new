// api/matchmaking.js
const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const room = require('../game/room');

const router = express.Router();

router.post('/matchmaking', authMiddleware, async (req, res) => {
  try {
    // Check if player already in an unfinished game
    const { data: existing } = await supabase
      .from('players')
      .select('game_id, game_sessions(is_active, is_finished)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && existing.game_sessions && !existing.game_sessions.is_finished) {
      return res.json({
        gameId: existing.game_id,
        isActive: existing.game_sessions.is_active,
      });
    }

    const r = await room.findOrCreateRoom();
    const player = await room.addPlayerToRoom(r, req.user.id, req.user.firstName);

    if (!player) {
      return res.status(409).json({ error: 'Lobby is full. Please try again.' });
    }

    res.json({ gameId: r.gameId, isActive: false });
  } catch (err) {
    console.error('Matchmaking error:', err);
    res.status(500).json({ error: 'Could not join a game' });
  }
});

router.get('/poll/waiting/:gameId', authMiddleware, async (req, res) => {
  try {
    const r = room.getRoom(req.params.gameId);
    if (!r) {
      // Room may have started and been cleared, check DB
      const { data: game } = await supabase
        .from('game_sessions')
        .select('is_active')
        .eq('id', req.params.gameId)
        .single();
      return res.json({ playerCount: 0, isActive: game ? game.is_active : false });
    }

    res.json({
      playerCount: r.realPlayerCount,
      isActive: r.phase !== 'waiting',
      maxPlayers: 6,
    });
  } catch (err) {
    console.error('Poll waiting error:', err);
    res.status(500).json({ error: 'Could not check waiting room' });
  }
});

router.get('/game/:gameId', authMiddleware, async (req, res) => {
  try {
    const r = room.getRoom(req.params.gameId);

    if (r) {
      return res.json({
        round: r.currentRound,
        totalRounds: 6,
        phase: r.phase,
        question: r.phase === 'play' ? r.questions[r.currentRound - 1] : null,
        players: room.serializePlayers(r),
        tradeLog: r.tradeLog,
        currentRoundTrades: r.currentRoundTrades,
      });
    }

    // Fallback to DB (game may have finished)
    const { data: game, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', req.params.gameId)
      .single();

    if (error || !game) return res.status(404).json({ error: 'Game not found' });

    if (game.is_finished) {
      const trueValue = (game.hidden_array || []).reduce((a, b) => a + b, 0);
      const { data: players } = await supabase
        .from('players')
        .select('*, users(first_name)')
        .eq('game_id', game.id)
        .eq('is_bot', false);

      const results = (players || [])
        .map(p => ({
          name: p.users ? p.users.first_name : 'Player',
          seat: p.seat_number,
          cash: p.cash,
          assets: p.asset_count,
          netPnl: p.net_pnl,
          roundsPlayed: p.rounds_played,
        }))
        .sort((a, b) => b.netPnl - a.netPnl)
        .map((p, i) => ({ ...p, rank: i + 1 }));

      return res.json({
        phase: 'finished',
        trueValue,
        hiddenArray: game.hidden_array,
        players: results,
        gameId: game.id,
        roomCode: game.room_code,
      });
    }

    res.json({ phase: 'unknown' });
  } catch (err) {
    console.error('Game state error:', err);
    res.status(500).json({ error: 'Could not load game state' });
  }
});

module.exports = router;
