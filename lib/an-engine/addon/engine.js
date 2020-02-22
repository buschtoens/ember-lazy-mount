import Engine from 'ember-engines/engine';
import loadInitializers from 'ember-load-initializers';

import config from './config/environment';
import Resolver from './resolver';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver
});

loadInitializers(Eng, modulePrefix);

export default Eng;
