// api/orders.js
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const room = require('../game/room');

const router = express.Router();

router.post('/order', authMiddleware, async (req, res) => {
  try {
    const { gameId, type, price } = req.body;

    if (!gameId || !type || price === undefined) {
      return res.status(400).json({ error: 'Missing gameId, type, or price' });
    }

    if (!['BID', 'ASK'].includes(type)) {
      return res.status(400).json({ error: 'Invalid order type' });
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum)) {
      return res.status(400).json({ error: 'Price must be a number' });
    }

    const r = room.getRoom(gameId);
    if (!r) return res.status(404).json({ error: 'Game not found or already ended' });

    // Find the player's playerId from userId
    let playerId = null;
    for (const [id, p] of r.players) {
      if (p.userId === req.user.id) { playerId = id; break; }
    }

    if (!playerId) return res.status(403).json({ error: 'You are not in this game' });

    const result = room.placeOrder(r, playerId, type, priceNum);

    if (!result.ok) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ status: 'queued', message: result.message });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Could not place order' });
  }
});

module.exports = router;
