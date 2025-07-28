const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache for stats
let statsCache = null;
let cacheTimestamp = null;

// Watch for file changes to invalidate cache
fs.watchFile(DATA_PATH, () => {
  statsCache = null;
  cacheTimestamp = null;
});

// Calculate stats
async function calculateStats() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf-8');
  const items = JSON.parse(raw);
  
  const stats = {
    total: items.length,
    averagePrice: items.length > 0 
      ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length 
      : 0
  };
  
  return stats;
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Return cached stats if available
    if (statsCache && cacheTimestamp) {
      return res.json(statsCache);
    }
    
    // Calculate and cache stats
    statsCache = await calculateStats();
    cacheTimestamp = Date.now();
    
    res.json(statsCache);
  } catch (err) {
    next(err);
  }
});

module.exports = router;