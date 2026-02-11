// Webshop API Key Authentication
// External webshops use an API key instead of JWT tokens

const WEBSHOP_API_KEYS = [
  {
    key: 'ws_live_loyalty2026_maxi',
    name: 'Maxi Webshop',
    active: true,
  },
  {
    key: 'ws_live_loyalty2026_idea',
    name: 'Idea Webshop',
    active: true,
  },
  {
    key: 'ws_test_loyalty2026',
    name: 'Test Webshop',
    active: true,
  },
];

const authenticateWebshop = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required. Set x-api-key header.' });
  }

  const webshop = WEBSHOP_API_KEYS.find(ws => ws.key === apiKey && ws.active);

  if (!webshop) {
    return res.status(403).json({ error: 'Invalid or inactive API key' });
  }

  // Attach webshop info to request
  req.webshop = { name: webshop.name, key: webshop.key };
  next();
};

module.exports = { authenticateWebshop, WEBSHOP_API_KEYS };
