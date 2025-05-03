const express = require('express');
const router = express.Router();
const { getToken, searchKeyword, lookupPart } = require('../services/digikeyApi');

router.post('/token', async (req, res) => {
  try {
    const token = await getToken();
    res.json({ access_token: token });
  } catch (error) {
    res.status(500).json({ error: 'Token fetch failed', message: error.message });
  }
});

router.post('/search', async (req, res) => {
  const { Keywords, RecordCount = 5 } = req.body;
  if (!Keywords) return res.status(400).json({ error: 'Keywords is required' });

  try {
    const result = await searchKeyword(Keywords, RecordCount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

router.post('/lookup', async (req, res) => {
  const { ManufacturerPartNumber } = req.body;
  if (!ManufacturerPartNumber) return res.status(400).json({ error: 'ManufacturerPartNumber is required' });

  try {
    const result = await lookupPart(ManufacturerPartNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Lookup failed', message: error.message });
  }
});

module.exports = router;
