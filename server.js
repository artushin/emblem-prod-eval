const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'age-verification-test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static('public'));

const requireVerification = (req, res, next) => {
  if (req.session.verified) {
    next();
  } else {
    res.redirect('/');
  }
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sdk-integration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sdk-integration.html'));
});

app.get('/api-integration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-integration.html'));
});

app.get('/protected', requireVerification, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

app.post('/api/create-session', async (req, res) => {
  try {
    const sessionId = 'mock-session-' + Date.now();
    const verificationUrl = `https://av.safepassageapp.com/verify?session=${sessionId}&return_url=${encodeURIComponent(req.body.return_url || 'http://localhost:3000/api/verify-session')}`;
    
    req.session.pendingSessionId = sessionId;
    
    res.json({
      success: true,
      session_id: sessionId,
      verification_url: verificationUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/verify-session', (req, res) => {
  const sessionId = req.query.session;
  const status = req.query.status;
  
  if (status === 'verified' && sessionId === req.session.pendingSessionId) {
    req.session.verified = true;
    req.session.verifiedSessionId = sessionId;
    delete req.session.pendingSessionId;
    res.redirect('/protected');
  } else {
    res.redirect('/?error=verification_failed');
  }
});

app.post('/api/mock-verify', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId === req.session.pendingSessionId) {
    req.session.verified = true;
    req.session.verifiedSessionId = sessionId;
    delete req.session.pendingSessionId;
    res.json({ success: true, verified: true });
  } else {
    res.json({ success: false, error: 'Invalid session' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Age verification test server running on http://localhost:${PORT}`);
});