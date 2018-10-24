import Component from '@ember/component';
import { get } from '@ember/object';
import { next } from '@ember/runloop';
import { tagName, layout } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { task } from 'ember-concurrency';
import template from './template';

@tagName('')
@layout(template)
export default class LazyMountComponent extends Component {
  @service
  engineLoader;

  static positionalParams = ['name'];

  @argument
  @type('string')
  name;

  @argument
  @type('any')
  model = null;

  @reads('loadEngine.last.value.name')
  loadedName;

  @reads('loadEngine.isRunning')
  isLoading;

  @reads('loadEngine.last.error')
  error;

  didReceiveAttrs() {
    // super.didReceiveAttrs();
    this._super();

    const name = get(this, 'name');
    if (name !== get(this, 'loadedName')) {
      // only load a new engine, if it is different from the last one
      next(() => {
        // this hack is currently required, because the task is only initialized
        // after `didReceiveAttrs` was run for the first time
        get(this, 'loadEngine').perform(name);
      });
    }
  }

  loadEngine = task(function*(name = get(this, 'name')) {
    const engineLoader = get(this, 'engineLoader');
    if (!engineLoader.isLoaded(name)) {
      yield get(this, 'engineLoader').load(name);
    }
    return { name };
  }).restartable();
}
