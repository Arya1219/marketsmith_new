// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const authRoutes = require('./api/auth');
const leaderboardRoutes = require('./api/leaderboard');
const matchmakingRoutes = require('./api/matchmaking');
const ordersRoutes = require('./api/orders');
const adminRoutes = require('./api/admin');
const room = require('./game/room');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Static files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin/public')));

// ─── API routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', matchmakingRoutes);
app.use('/api', ordersRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health check (for hosting platform pings) ───────────────
app.get('/health', (req, res) => res.status(200).send('OK'));

// ─── Page routes (so direct URL navigation and refresh work) ─
const pages = ['login', 'lobby', 'waiting', 'game', 'results'];
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/login.html')));
app.get('/lobby', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/lobby.html')));
app.get('/waiting/:gameId', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/waiting.html')));
app.get('/game/:gameId', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/game.html')));
app.get('/game/:gameId/results', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/results.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin/public/login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'admin/public/dashboard.html')));

// ─── Socket.io ────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token provided'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userName = decoded.firstName;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  let currentGameId = null;
  let currentPlayerId = null;

  socket.on('join_waiting', async ({ gameId }) => {
    try {
      const r = room.getRoom(gameId);
      if (!r) return socket.emit('order_error', { message: 'Game not found' });

      currentGameId = gameId;
      socket.join(gameId);

      // Find this user's playerId in the room
      for (const [id, p] of r.players) {
        if (p.userId === socket.userId) {
          currentPlayerId = id;
          p.socketId = socket.id;
          room.handleReconnect(r, id, socket.id);
          break;
        }
      }

      io.to(gameId).emit('player_count', {
        count: r.realPlayerCount,
        max: 6,
      });

      // If room just reached 6 real players, start the game
      if (r.phase === 'waiting' && r.realPlayerCount === 6) {
        await room.startGame(r, io);
        io.to(gameId).emit('game_started');
      }
    } catch (err) {
      console.error('join_waiting error:', err);
      socket.emit('order_error', { message: 'Could not join waiting room' });
    }
  });

  socket.on('place_order', ({ gameId, type, price }) => {
    try {
      const r = room.getRoom(gameId);
      if (!r) return socket.emit('order_error', { message: 'Game not found' });

      let playerId = currentPlayerId;
      if (!playerId) {
        for (const [id, p] of r.players) {
          if (p.userId === socket.userId) { playerId = id; break; }
        }
      }
      if (!playerId) return socket.emit('order_error', { message: 'You are not in this game' });

      const result = room.placeOrder(r, playerId, type, parseInt(price, 10));
      if (result.ok) {
        socket.emit('order_confirmed', { message: result.message, type, price });
      } else {
        socket.emit('order_error', { message: result.message });
      }
    } catch (err) {
      console.error('place_order error:', err);
      socket.emit('order_error', { message: 'Could not place order' });
    }
  });

  socket.on('disconnect', () => {
    if (currentGameId && currentPlayerId) {
      const r = room.getRoom(currentGameId);
      if (r) {
        room.handleDisconnect(r, currentPlayerId, io);
        io.to(currentGameId).emit('player_count', {
          count: r.realPlayerCount,
          max: 6,
        });
      }
    }
  });
});

// ─── Error handling ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MarketSmith server running on port ${PORT}`);
});
