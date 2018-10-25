'use strict';

const defaultTargets = [
  'last 2 versions',
  'not dead'
];

exports.normalize = function (targets) {
  if (targets) {
    if (typeof targets === 'string') {
      targets = targets.split(',')
        .map(item => item.trim())
        .filter(item => !!item);
    }
  } else {
    targets = defaultTargets;
  }

  return targets;
};

exports.toFileName = function toFileName(targets) {
  return `${targets.join(',')}.json`;
};