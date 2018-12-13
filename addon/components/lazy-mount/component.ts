import Component from '@ember/component';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { tagName, layout } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';
import { restartableTask } from 'ember-concurrency-decorators';
import template from './template';
import EngineLoaderService from 'ember-lazy-mount/services/engine-loader';
import Task from 'ember-lazy-mount/interfaces/task';

type LoadEngineTask = Task<[string], { error?: Error; name?: string }>;

@tagName('')
@layout(template)
export default class LazyMountComponent extends Component {
  @service engineLoader!: EngineLoaderService;

  static positionalParams = ['name'];

  name!: string;

  model?: any = null;

  @reads('loadEngine.last.value.name') loadedName?: string;

  @reads('loadEngine.last.value.error') error?: Error;

  @reads('loadEngine.isRunning') isLoading!: boolean;

  didReceiveAttrs() {
    super.didReceiveAttrs && super.didReceiveAttrs();

    const name = get(this, 'name');
    assert(`lazy-mount: Argument 'name' is missing.`, Boolean(name));

    if (name !== get(this, 'loadedName')) {
      // only load a new engine, if it is different from the last one
      ((get(this, 'loadEngine') as unknown) as LoadEngineTask).perform(name);
    }
  }

  @restartableTask
  loadEngine = function*(this: LazyMountComponent, name = get(this, 'name')) {
    const engineLoader = get(this, 'engineLoader');
    if (!engineLoader.isLoaded(name)) {
      try {
        yield engineLoader.load(name);
      } catch (error) {
        return { error };
      }
    }
    return { name };
  };
}
