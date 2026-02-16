// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

// CORS whitelist: set ALLOWED_ORIGIN to your GitHub Pages URL, e.g. 'https://YOUR_GITHUB_USERNAME.github.io'
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigin === '*' || origin === allowedOrigin) return callback(null, true);
    callback(new Error('CORS not allowed'));
  }
}));

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

app.get('/', (req, res) => res.send('OK'));

app.post('/message', (req, res) => {
  const { name = 'Anon', text = '' } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, error: 'empty text' });
  const payload = { name, text, ts: Date.now() };
  pusher.trigger('public-chat', 'new-message', payload)
    .then(() => res.json({ ok: true }))
    .catch(err => {
      console.error('pusher error', err);
      res.status(500).json({ ok: false, error: err.message });
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on ${port}`));
