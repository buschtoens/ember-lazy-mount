'use strict';

const { buildEngine } = require('ember-engines/lib/engine-addon');

module.exports = buildEngine({
  name: 'test-engine2',

  lazyLoading: {
    enabled: true,
  },

  isDevelopingAddon() {
    return true;
  },
});
