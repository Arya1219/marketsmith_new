// game/trading.js
// Price-time priority order matching engine

/**
 * Match orders and return list of trades.
 * @param {Array} orders - array of { playerId, type: 'BID'|'ASK', price, timestamp, isBot }
 * @returns {Array} trades - array of { buyerId, sellerId, price }
 */
function matchOrders(orders) {
  const bids = orders
    .filter(o => o.type === 'BID')
    .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp); // highest price first, earliest time first

  const asks = orders
    .filter(o => o.type === 'ASK')
    .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp); // lowest price first, earliest time first

  const trades = [];
  let bidIdx = 0;
  let askIdx = 0;

  while (bidIdx < bids.length && askIdx < asks.length) {
    const bid = bids[bidIdx];
    const ask = asks[askIdx];

    // No cross — stop
    if (bid.price < ask.price) break;

    // No self-trade
    if (bid.playerId === ask.playerId) {
      askIdx++;
      continue;
    }

    // Midpoint clearing price (rounded up)
    const clearingPrice = Math.floor((bid.price + ask.price) / 2);

    trades.push({
      buyerId: bid.playerId,
      sellerId: ask.playerId,
      price: clearingPrice,
      buyerIsBot: bid.isBot || false,
      sellerIsBot: ask.isBot || false,
    });

    bidIdx++;
    askIdx++;
  }

  return trades;
}

/**
 * Apply trades to player states in memory.
 * Enforces: seller must keep at least 0 asset.
 * @param {Map} playerStates - map of playerId -> { cash, assetCount }
 * @param {Array} trades
 * @returns {Array} executedTrades - trades that actually went through
 */
function applyTrades(playerStates, trades) {
  const executed = [];

  for (const trade of trades) {
    const buyer = playerStates.get(trade.buyerId);
    const seller = playerStates.get(trade.sellerId);

    if (!buyer || !seller) continue;

    // Seller must keep at least 0 asset — hard rule
    if (seller.assetCount <= 0) continue;

    buyer.cash -= trade.price;
    buyer.assetCount += 1;
    seller.cash += trade.price;
    seller.assetCount -= 1;

    executed.push(trade);
  }

  return executed;
}

module.exports = { matchOrders, applyTrades };
