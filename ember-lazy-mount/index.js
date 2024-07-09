'use strict';

module.exports = {
  name: require('./package').name,

  // This is required to make the host lookup mechanism in ember-engines work
  // for the dummy app.
  // https://github.com/ember-engines/ember-engines/blob/039501dd70962565c54bb34da2e96b1019ae50e7/lib/utils/find-hosts-host.js#L11
  lazyLoading: {},
};
