-- ============================================================
-- MARKETSMITH — Supabase Schema
-- Run this entire file in Supabase SQL editor
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  total_pnl INTEGER DEFAULT 0,
  best_game_pnl INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_finished BOOLEAN DEFAULT FALSE,
  is_void BOOLEAN DEFAULT FALSE,
  hidden_array JSONB DEFAULT '[]',
  ques_list JSONB DEFAULT '[]',
  current_round INTEGER DEFAULT 1,
  round_phase TEXT DEFAULT 'play',
  round_start_time TIMESTAMPTZ,
  last_trade_log JSONB DEFAULT '[]',
  current_round_trades JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Players table (one row per player per game)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  cash INTEGER DEFAULT 0,
  asset_count INTEGER DEFAULT 2,
  has_received_bonus BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  bot_name TEXT,
  rounds_played INTEGER DEFAULT 0,
  net_pnl INTEGER DEFAULT 0,
  is_connected BOOLEAN DEFAULT TRUE,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, seat_number),
  UNIQUE(user_id, game_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  order_type TEXT CHECK (order_type IN ('BID', 'ASK')) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 1 AND price <= 100),
  round_number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (executed trades)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES players(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES players(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round snapshots table — for per-round CSV export and defective round removal
CREATE TABLE IF NOT EXISTS round_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  cash_after INTEGER NOT NULL,
  assets_after INTEGER NOT NULL,
  round_pnl INTEGER NOT NULL,
  cumulative_pnl INTEGER NOT NULL,
  trades_in_round INTEGER DEFAULT 0,
  rounds_played_so_far INTEGER DEFAULT 1,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_user ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_game_round ON orders(game_id, round_number);
CREATE INDEX IF NOT EXISTS idx_transactions_game ON transactions(game_id);
CREATE INDEX IF NOT EXISTS idx_round_snapshots_game ON round_snapshots(game_id);
CREATE INDEX IF NOT EXISTS idx_round_snapshots_user ON round_snapshots(user_id);
