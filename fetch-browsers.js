'use strict';

// run target to get new list:
// `npx --ignore-existing browserslist 'last 2 versions,ie 11,not dead'

const execa = require('execa');

module.exports = async function fetch(targets) {
  let args = [
    '--ignore-existing',
    'browserslist',
    `\'${targets.join(',')}\'`
  ];
  let { stdout } = await execa('npx', args);

  if (stdout) {
    let browserVersions = stdout.split('\n')
      .map(item => item.trim())
      .filter(item => !!item);

    return browserVersions;
  }
};