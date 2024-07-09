// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { assert } from '@ember/debug';
import { action, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { buildWaiter } from '@ember/test-waiters';

import type EngineLoaderService from '../services/engine-loader.ts';

const waiter = buildWaiter('ember-lazy-mount:lazy-mount');

interface LazyMountSignature {
  Args: {
    name: string;
    model: unknown;
  };
  Blocks: {
    default: [
      | { isLoading: true; error: null }
      | { isLoading: false; error: Error }
      | undefined,
    ];
  };
}

/**
 * The `{{lazy-mount}}` component works just like the
 * [`{{mount}}` helper](https://api.emberjs.com/ember/5.9/classes/Ember.Templates.helpers/methods/mount?anchor=mount).
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
 * {{#lazy-mount this.engineName model=this.optionalDataForTheEngine as |engine|}}
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
export default class LazyMount extends Component<LazyMountSignature> {
  tagName = '';

  @service declare engineLoader: EngineLoaderService;

  /**
   * The name of the engine to load and subsequently mount.
   *
   * @property name
   * @type {string}
   * @public
   */
  name: string | null = null;

  /**
   * Optional model that will be passed through to the engine.
   *
   * @see https://emberjs.com/api/ember/3.7/classes/Ember.Templates.helpers/methods/mount?anchor=mount
   *
   * @property model
   * @type {any?}
   * @public
   */
  model: unknown = null;

  /**
   * Optional callback called when the engine starts loading.
   *
   * @property onLoad
   * @type {(() => void)?}
   * @public
   */
  onLoad: (() => void) | null = null;

  /**
   * Optional callback called when the engine finished loading.
   *
   * @property didLoad
   * @type {(() => void)?}
   * @public
   */
  didLoad: (() => void) | null = null;

  /**
   * Optional callback called when the engine filed to load.
   *
   * @property onLoad
   * @type {((error: Error) => void)?}
   * @public
   */
  onError: ((error: Error) => void) | null = null;

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
  loadedName: string | null = null;

  /**
   * If an error occurred while loading the engine, it will be set here.
   *
   * @property error
   * @type {Error?}
   * @private
   */
  error: Error | null = null;

  /**
   * While the bundle is being loaded, this property is `true`.
   *
   * @property isLoading
   * @type {boolean}
   * @private
   */
  isLoading: boolean = false;

  @action initLoadEngine(name: string): void {
    assert(`lazy-mount: Argument 'name' is missing.`, name);

    if (name !== this.loadedName) {
      // only load a new engine, if it is different from the last one
      this.loadEngine(name);
    }
  }

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
  async loadEngine(name: string): Promise<void> {
    const shouldCancel = this._thread();
    const engineLoader = this.engineLoader;

    this.setLoading();

    if (!engineLoader.isLoaded(name)) {
      const token = waiter.beginAsync();

      try {
        await engineLoader.load(name);
        if (shouldCancel()) return;
      } catch (error) {
        if (shouldCancel()) return;
        this.setError(error as Error);
        return;
      } finally {
        waiter.endAsync(token);
      }
    }

    this.setLoaded(name);
  }

  setLoading() {
    this.onLoad?.();
    setProperties(this, { loadedName: null, error: null, isLoading: true });
  }

  setLoaded(loadedName: string) {
    this.didLoad?.();
    setProperties(this, { loadedName, error: null, isLoading: false });
  }

  setError(error: Error) {
    this.onError?.(error);
    setProperties(this, { loadedName: null, error, isLoading: false });
  }

  /**
   * The following is a really low-fidelity implementation of something that
   * would be handled by ember-concurrency or ember-lifeline.
   */
  _threadId: Record<string, never> | null = null;

  _thread() {
    const threadId = (this._threadId = {});

    return () =>
      this.isDestroyed || this.isDestroying || this._threadId !== threadId;
  }
}

LazyMount.reopenClass({
  positionalParams: ['name'],
});
