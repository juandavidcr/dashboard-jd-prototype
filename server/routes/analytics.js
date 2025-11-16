const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.get('/', async (req, res) => {
  // Call the python script and return its JSON output
  const py = spawn('python3', [__dirname + '/../analytics.py'], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let out = '';
  let err = '';
  py.stdout.on('data', (chunk) => out += chunk.toString());
  py.stderr.on('data', (chunk) => err += chunk.toString());
  py.on('close', (code) => {
    if (err) console.error('python stderr:', err);
    if (!out) return res.status(500).json({ error: 'No output from python', detail: err });
    try {
      const obj = JSON.parse(out);
      if (obj.error) return res.status(500).json(obj);
      return res.json(obj);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from python', detail: e.message, raw: out });
    }
  });
});

module.exports = router;
