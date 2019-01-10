import Ember from 'ember';
import Component from '@ember/component';
import { get, set, setProperties } from '@ember/object';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { registerWaiter } from '@ember/test';
import template from './template';

/**
 * The `{{lazy-mount}}` component works just like the
 * [`{{mount}}` helper](https://emberjs.com/api/ember/3.5/classes/Ember.Templates.helpers/methods/mount?anchor=mount).
 *
 * It accepts the name of the engine as a positional parameter and also an
 * optional `model` parameter.
 *
 * As soon as the helper is rendered, it will begin loading the specified
 * engine. If the engine is already loaded, it will be mounted immediately.
 *
 * The `engineName` and `model` parameters are dynamic and you can update them.
 * Setting a new `engineName` will cause the new engine to be loaded and mounted.
 *
 * #### Inline Usage
 *
 * While the engine is loading, nothing is rendered. If there was an error
 * loading the engine, nothing is rendered.
 *
 * ```hbs
 * {{lazy-mount engineName model=optionalDataForTheEngine}}
 * ```
 *
 * #### Block Usage
 *
 * While the engine is loading or if there was an error loading the engine, the
 * block that is passed to the component is rendered. The `engine` block
 * parameter is an object with two properties:
 *
 * - **`isLoading`**: _`boolean`_ — Whether or not the engine is currently
 *   loading
 * - **`error`**: _`Error | null`_ — If there was an error loading the engine
 *
 * When the engine was loaded successfully, the passed in block is replaced by
 * the engine.
 *
 * ```hbs
 * {{#lazy-mount engineName model=optionalDataForTheEngine as |engine|}}
 *   {{#if engine.isLoading}}
 *     🕑 The engine is loading...
 *   {{else if engine.error}}
 *     😨 There was an error loading the engine:
 *     <code>{{engine.error}}</code>
 *   {{/if}}
 * {{/lazy-mount}}
 * ```
 *
 * @class LazyMountComponent
 * @param {string} name Name of the engine to mount.
 * @param {any} [model] Object that will be set as
 *                      the model of the engine.
 * @public
 */
export default Component.extend({
  tagName: '',
  layout: template,

  engineLoader: service(),

  /**
   * The name of the engine to load and subsequently mount.
   *
   * @property name
   * @type {string}
   * @public
   */
  name: null,

  /**
   * Optional model that will be passed through to the engine.
   *
   * @see https://emberjs.com/api/ember/3.7/classes/Ember.Templates.helpers/methods/mount?anchor=mount
   *
   * @property model
   * @type {any?}
   * @public
   */
  model: null,

  /**
   * When the engine was loaded successfully, this will then be the name of the
   * engine. Presence of this field therefore indicates that the engine was
   * loaded successfully.
   *
   * This field is also used by `didReceiveAttrs` for diffing.
   *
   * @property loadedName
   * @type {string?}
   * @private
   */
  loadedName: null,

  /**
   * If an error occurred while loading the engine, it will be set here.
   *
   * @property error
   * @type {Error?}
   * @private
   */
  error: null,

  /**
   * While the bundle is being loaded, this property is `true`.
   *
   * @property isLoading
   * @type {boolean}
   * @private
   */
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

  /**
   * Manages the life cycle of loading an engine bundle and setting the
   * following properties in accordance:
   *
   * - `isLoading`
   * - `error`
   * - `loadedName`
   *
   * Called by `didReceiveAttrs`.
   *
   * @method loadEngine
   * @param {string} name
   * @async
   * @private
   */
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
    if (Ember.testing) {
      registerWaiter(this, () => !get(this, 'isLoading'));
    }

    const threadId = set(this, '_threadId', {});
    return () =>
      get(this, 'isDestroyed') ||
      get(this, 'isDestroying') ||
      get(this, '_threadId') !== threadId;
  }
}).reopenClass({
  positionalParams: ['name']
});
