// game/bots.js
// Bot order placement logic

/**
 * Generate bot orders for a round.
 * Bot knows the true value (sum of all digits) and adds noise.
 * Purpose: ensure trades can happen if humans don't cross.
 *
 * @param {number} trueValue - sum of all 6 hidden digits
 * @param {string} botId - player ID of the bot
 * @param {number} round - current round number (1-6)
 * @returns {{ bid: {playerId, type, price, timestamp, isBot}, ask: {playerId, type, price, timestamp, isBot} }}
 */
function generateBotOrders(currentEV, botId, round) {
  // Noise range: ±5 on estimate
  const noise = Math.floor(Math.random() * 11) - 5; // -5 to +5
  const estimate = Math.max(
  1,
  Math.min(100, currentEV + noise)
);

  // Spread: bot places bid slightly below and ask slightly above estimate
  const spread = Math.floor(Math.random() * 4) + 2; // 2 to 5

  const bidPrice = Math.max(1, Math.min(100, Math.round(estimate - spread)));
  const askPrice = Math.max(1, Math.min(100, Math.round(estimate + spread)));

  // Bots place orders early in the round (0-5 seconds in)
  const now = Date.now();
  const bidTimestamp = now + Math.floor(Math.random() * 5000);
  const askTimestamp = now + Math.floor(Math.random() * 5000);

  return {
    bid: {
      playerId: botId,
      type: 'BID',
      price: bidPrice,
      timestamp: bidTimestamp,
      isBot: true,
    },
    ask: {
      playerId: botId,
      type: 'ASK',
      price: askPrice,
      timestamp: askTimestamp,
      isBot: true,
    },
  };
}

module.exports = { generateBotOrders };
