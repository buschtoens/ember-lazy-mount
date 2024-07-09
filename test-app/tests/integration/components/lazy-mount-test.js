/* eslint-disable ember/no-runloop */
import { render, settled } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { run } from '@ember/runloop';
import { schedule } from '@ember/runloop';
import Service from '@ember/service';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | lazy-mount', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    this.onError = () => assert.step('onError');
    this.onLoad = () => assert.step('onLoad');
    this.didLoad = () => assert.step('didLoad');
  });

  const TEMPLATE = hbs`
    {{#lazy-mount
      this.engineName
      onError=this.onError
      onLoad=this.onLoad
      didLoad=this.didLoad
      as |e|
    }}
      isLoading: {{e.isLoading}};
      error: {{e.error}};
    {{/lazy-mount}}
  `;

  test('it works', async function (assert) {
    assert.expect(7);

    this.engineName = 'test-engine';

    render(TEMPLATE);

    // Using `await render(...)` instead is flaky, because sometimes the request
    // starts before the render queue is flushed. This then causes the `await`
    // to also wait for the request to finish, meaning that we never get to test
    // the loading state.
    schedule('afterRender', () => {
      assert.verifySteps(['onLoad']);
      assert
        .dom()
        .hasText('isLoading: true; error: ;', 'shows a loading state');
    });

    // Wait for the engine to be loaded and the template to update.
    await settled();

    assert.verifySteps(['didLoad']);
    assert
      .dom()
      .hasText('Hello from the other side.', 'shows the engine template');

    assert.verifySteps([]);
  });

  test('it throws an error right away for a non-existing engine', async function (assert) {
    this.engineName = 'not-an-engine';

    run(() => render(TEMPLATE));

    schedule('afterRender', () => {
      assert
        .dom()
        .hasText(
          'isLoading: false; error: Error: Assertion Failed: No bundle with name "not-an-engine" exists in the asset manifest.;',
        );
      assert.verifySteps(['onLoad', 'onError']);
    });
  });

  test('it shows a loading state and an error', async function (assert) {
    assert.expect(6);

    class AssetLoaderService extends Service {
      async loadBundle() {
        await new Promise((resolve) => schedule('afterRender', resolve));
        throw new Error('something failed');
      }
    }
    this.owner.unregister('service:asset-loader');
    this.owner.register('service:asset-loader', AssetLoaderService);

    this.engineName = 'test-engine';

    render(TEMPLATE);

    // Using `await render(...)` instead would not work, since the timer in
    // `loadBundle` is synchronously added to the queue in order to avoid
    // blazing past the promise with the last assertion. The alternative would
    // be storing the promise in the closure of the test and awaiting it further
    // down.
    schedule('afterRender', () => {
      assert.verifySteps(['onLoad']);
      assert
        .dom()
        .hasText('isLoading: true; error: ;', 'shows a loading state');
    });

    // Waits for the promise in `loadBundle` to resolve and the template to re-render.
    await settled();

    assert.verifySteps(['onError']);
    assert
      .dom()
      .hasText(
        'isLoading: false; error: Error: something failed;',
        'shows an error',
      );
  });
});
