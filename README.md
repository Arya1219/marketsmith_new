# MarketSmith

QuantX Week 2 · IIT BHU Quant Club — Trading game.

## Stack
- Backend: Node.js + Express + Socket.io
- Database: Supabase (Postgres)
- Frontend: Plain HTML/CSS/JS (no framework, mobile + desktop responsive)

## Setup

### 1. Supabase
1. Create a project at supabase.com
2. Open SQL Editor, paste and run `schema.sql`
3. Copy your Project URL and `service_role` key (Settings → API)

### 2. Environment
```
cp .env.example .env
```
Fill in:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` — any long random string
- `ADMIN_PASSWORD` — password for `/admin` login

### 3. Install & run
```
npm install
npm start
```
Visit `http://localhost:3000`

### 4. Create participant accounts
Edit `scripts/create-users.js`, add all participants with name/email/phone, then:
```
node scripts/create-users.js
```
This prints each generated password (first 4 letters of name + last 4 digits of phone). Share these with participants.

### 5. Admin panel
Visit `/admin`, log in with `ADMIN_PASSWORD` from your `.env`.

## Deployment (Railway / Render)
1. Push this folder to a GitHub repo
2. Create a new Web Service, connect the repo
3. Set environment variables (same as `.env`) in the platform's dashboard
4. Build command: `npm install` — Start command: `npm start`
5. Done — the platform gives you a live URL

## Game rules implemented
- 6 real players + 2 bots per table, hard cap enforced server-side (never more than 6)
- 45 second rounds, 6 rounds per game, 10 second trade-log popup between rounds
- PnL is cumulative across rounds, never reset
- One BID + one ASK per player per round, midpoint clearing price, price-time priority
- Sellers can never drop below 1 asset (hard guard against the asset-count-zero bug)
- Bots trade off true value ± noise, purely to provide liquidity; bot PnL excluded from leaderboard
- Disconnected players get a 22 second grace period before their seat is considered vacant; no replacement player is added mid-game
- Every player's `rounds_played` is tracked individually, so partial participation is recorded accurately
- Round-by-round snapshots saved to `round_snapshots` table — lets the admin void a single defective game and have PnL totals automatically corrected
