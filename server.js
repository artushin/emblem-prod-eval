const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'age-verification-test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sdk-integration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sdk-integration.html'));
});

app.get('/api-integration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-integration.html'));
});

app.get('/protected', async (req, res) => {
  // Handle SafePassage verification results
  if (req.query.verified === 'true') {
    if (req.query.sessionId) {
      const response = await fetch('https://api.safepassageapp.com/api/v1/sessions/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk_18d228ebdc9439e8d38a47d3b03a33eb6ac4677e54bb529bdc359c78d6f97c26`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: req.query.sessionId })
      });

      const validation = await response.json();
      console.log('VALIDATION:', validation);
    }
  } else if (req.query.cancelled === 'true') {
    return res.redirect('/?error=verification_cancelled');
  }
  
  // Check if user is verified
  if (req.session.verified) {
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
  } else {
    res.redirect('/');
  }
});

app.post('/api/verify-age', async (req, res) => {
  const sessionId = uuidv4();

  // Create session with SafePassage
  const response = await fetch('https://api.safepassageapp.com/api/v1/sessions/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer sk_18d228ebdc9439e8d38a47d3b03a33eb6ac4677e54bb529bdc359c78d6f97c26`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      returnUrl: 'https://localhost:3000/protected?verified=true',
      cancelUrl: 'https://localhost:3000/protected?cancelled=true'
    })
  });

  const session = await response.json();

  // Save to your database
  await db.sessions.create({ sessionId, userId: req.user.id });

  // NEW: Simply redirect to the provided verifyUrl
  res.redirect(session.verifyUrl);
});

// HTTPS server setup
const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Age verification test server running on https://localhost:${PORT}`);
});

// Optional: redirect HTTP to HTTPS
const HTTP_PORT = 8080;
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(`https://localhost:${PORT}${req.url}`);
});
httpApp.listen(HTTP_PORT, () => {
  console.log(`HTTP redirect server running on port ${HTTP_PORT}`);
});