'use strict';

const { matchesUA } = require('browserslist-useragent')
const express = require('express');
const cors = require('cors');
const app = express();
const defaultTargets = [
  'last 2 versions',
  'ie 11'
];

app.use(cors());

app.get('/checkbrowser', (req, res) => {
  let userAgent = req.query.userAgent || req.headers['user-agent'];
  let targets = req.query.browserTargets;

  if (!userAgent) {
    res.status(400).json({
      error: 'User agent not specified via "userAgent" query param or "user-agent" header'
    });
    return;
  }

  if (targets) {
    if (typeof targets === 'string') {
      targets = targets.split(',')
        .map(item => item.trim())
        .filter(item => !!item);
    }
  } else {
    targets = defaultTargets;
  }

  let matchesTargets = matchesUA(userAgent, {
    browsers: targets,
    allowHigherVersions: true
  });
  
  res.json({ matchesTargets, targets, userAgent });
});

// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});