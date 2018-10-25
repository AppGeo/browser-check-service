'use strict';

const express = require('express');
const Router = require('co-router');
const cors = require('cors');
const { matchesUA, normalizeQuery } = require('./app/match');
const fetchBrowsers = require('./app/fetch-browsers');
const {
  find: findBrowsersFromStorage,
  upload: uploadBrowsersToStorage,
  findAll: findAllTargets
} = require('./app/storage');
const app = express();
const router = new Router();
const defaultTargets = [
  'last 2 versions',
  'not dead'
];

app.use(cors());

router.get('/checkbrowser', async (req, res) => {
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

  let normalizedTargets = targets.map(normalizeQuery);
  let targetsId = `${normalizedTargets.join(',')}.json`;
  let { list: browserslist, updated } = await findBrowsersFromStorage(targetsId);

  if (!browserslist) {
    browserslist = await fetchBrowsers(normalizedTargets);
    // a bit slower for the first person doing this query
    // the cron job takes care of updating existing files
    await uploadBrowsersToStorage(targetsId, browserslist);
  }

  let matchesTargets = matchesUA(userAgent, {
    browsers: targets,
    browserslist,
    allowHigherVersions: true
  });
  
  res.json({
    matchesTargets,
    targets,
    userAgent,
    browsersListUpdated: updated
  });
});

router.get('/updatebrowsers', async function (req, res) {
  try {
    let files = await findAllTargets();

    for (let file of files) {
      let decodedId = decodeURIComponent(file.id);
      let targets = decodedId.replace('.json', '');
      let normalizedTargets = targets.split(',').map(normalizeQuery);
      let browserslist = await fetchBrowsers(normalizedTargets);

      await uploadBrowsersToStorage(decodedId, browserslist);
    }

    console.log(`Updated ${files.length} files`);
    res.status(200).send(`Updated ${files.length} files`);
  } catch(e) {
    console.log('Error updating files');
    res.status(500).send('Error updating files: ' + e);
  }
});

app.use('/', router);

// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});