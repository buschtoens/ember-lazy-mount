import Component from '@ember/component';
import { get, set, setProperties } from '@ember/object';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { registerWaiter } from '@ember/test';
import template from './template';

export default Component.extend({
  tagName: '',
  layout: template,

  engineLoader: service(),

  name: null,
  model: null,

  loadedName: null,
  error: null,
  isLoading: false,

  didReceiveAttrs() {
    this._super();

    const name = get(this, 'name');
    assert(`lazy-mount: Argument 'name' is missing.`, name);

    if (name !== get(this, 'loadedName')) {
      // only load a new engine, if it is different from the last one
      this.loadEngine(name);
    }
  },

  async loadEngine(name = get(this, 'name')) {
    const shouldCancel = this._thread();
    const engineLoader = get(this, 'engineLoader');

    this.setLoading();

    if (!engineLoader.isLoaded(name)) {
      try {
        await engineLoader.load(name);
        if (shouldCancel()) return;
      } catch (error) {
        if (shouldCancel()) return;
        this.setError(error);
        return;
      }
    }

    this.setLoaded(name);
  },

  setLoading() {
    setProperties(this, { loadedName: null, error: null, isLoading: true });
  },
  setLoaded(loadedName) {
    setProperties(this, { loadedName, error: null, isLoading: false });
  },
  setError(error) {
    setProperties(this, { loadedName: null, error, isLoading: false });
  },

  /**
   * The following is a really low-fidelity implementation of something that
   * would be handled by ember-concurrency or ember-lifeline.
   */

  _threadId: null,

  _thread() {
    registerWaiter(this, () => !get(this, 'isLoading'));
    const threadId = set(this, '_threadId', {});
    return () =>
      get(this, 'isDestroyed') ||
      get(this, 'isDestroying') ||
      get(this, '_threadId') !== threadId;
  }
}).reopenClass({
  positionalParams: ['name']
});
