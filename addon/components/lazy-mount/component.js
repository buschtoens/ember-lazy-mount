import Component from '@ember/component';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { tagName, layout } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';
import { restartableTask } from 'ember-concurrency-decorators';
import template from './template';

@tagName('')
@layout(template)
export default class LazyMountComponent extends Component {
  @service
  engineLoader;

  static positionalParams = ['name'];

  name;

  model = null;

  @reads('loadEngine.last.value.name')
  loadedName;

  @reads('loadEngine.isRunning')
  isLoading;

  @reads('loadEngine.last.value.error')
  error;

  didReceiveAttrs() {
    super.didReceiveAttrs && super.didReceiveAttrs();

    const name = get(this, 'name');
    assert(`lazy-mount: Argument 'name' is missing.`, name);

    if (name !== get(this, 'loadedName')) {
      // only load a new engine, if it is different from the last one
      get(this, 'loadEngine').perform(name);
    }
  }

  @restartableTask
  *loadEngine(name = get(this, 'name')) {
    const engineLoader = get(this, 'engineLoader');
    if (!engineLoader.isLoaded(name)) {
      try {
        yield engineLoader.load(name);
      } catch (error) {
        return { error }
      }
    }
    return { name };
  };
}
