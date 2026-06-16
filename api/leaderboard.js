// api/leaderboard.js
const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name, games_played, total_pnl')
      .order('total_pnl', { ascending: false })
      .limit(50);

    if (error) throw error;

    const leaderboard = data.map((u, i) => ({
      rank: i + 1,
      name: u.first_name,
      gamesPlayed: u.games_played,
      totalPnl: u.total_pnl,
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('first_name, email, games_played, total_pnl, best_game_pnl')
      .eq('id', req.user.id)
      .single();

    if (error || !user) throw error || new Error('User not found');

    const { data: recentGames } = await supabase
      .from('players')
      .select('game_id, net_pnl, rounds_played, created_at, game_sessions(room_code, current_round, finished_at, is_finished, is_void)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const history = (recentGames || [])
      .filter(g => g.game_sessions && g.game_sessions.is_finished)
      .map(g => ({
        gameId: g.game_id,
        roomCode: g.game_sessions.room_code,
        date: g.game_sessions.finished_at,
        rounds: g.rounds_played,
        pnl: g.net_pnl,
        void: g.game_sessions.is_void,
      }));

    res.json({
      name: user.first_name,
      email: user.email,
      gamesPlayed: user.games_played,
      totalPnl: user.total_pnl,
      bestGamePnl: user.best_game_pnl,
      history,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Could not load profile' });
  }
});

module.exports = router;
