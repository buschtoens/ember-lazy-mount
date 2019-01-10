import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { schedule } from '@ember/runloop';

module('Integration | Component | lazy-mount', function(hooks) {
  setupRenderingTest(hooks);

  test('it works', async function(assert) {
    assert.expect(2);

    render(hbs`
      <LazyMount @name="an-engine" as |e|>
        isLoading: {{e.isLoading}};
        error: {{e.error}};
      </LazyMount>
    `);

    // Using `await render(...)` instead is flaky, because sometimes the request
    // starts before the render queue is flushed. This then causes the `await`
    // to also wait for the request to finish, meaning that we never get to test
    // the loading state.
    schedule('afterRender', () =>
      assert.dom().hasText('isLoading: true; error: ;', 'shows a loading state')
    );

    // Wait for the engine to be loaded and the template to update.
    await settled();

    assert
      .dom()
      .hasText('Hello from the other side.', 'shows the engine template');
  });

  test('it shows an error right away for a non-existing engine', async function(assert) {
    await render(hbs`
      <LazyMount @name="not-an-engine" as |e|>
        isLoading: {{e.isLoading}};
        error: {{e.error}};
      </LazyMount>
    `);

    assert
      .dom()
      .hasText(
        'isLoading: false; error: Error: Assertion Failed: No bundle with name "not-an-engine" exists in the asset manifest.;'
      );
  });

  test('it shows a loading state and an error', async function(assert) {
    assert.expect(2);

    class AssetLoaderService extends Service {
      async loadBundle() {
        await new Promise(resolve => schedule('afterRender', resolve));
        throw new Error('something failed');
      }
    }
    this.owner.unregister('service:asset-loader');
    this.owner.register('service:asset-loader', AssetLoaderService);

    render(hbs`
      <LazyMount @name="an-engine" as |e|>
        isLoading: {{e.isLoading}};
        error: {{e.error}};
      </LazyMount>
    `);

    // Using `await render(...)` instead would not work, since the timer in
    // `loadBundle` is synchronously added to the queue in order to avoid
    // blazing past the promise with the last assertion. The alternative would
    // be storing the promise in the closure of the test and awaiting it further
    // down.
    schedule('afterRender', () =>
      assert.dom().hasText('isLoading: true; error: ;', 'shows a loading state')
    );

    // Waits for the promise in `loadBundle` to resolve and the template to re-render.
    await settled();

    assert
      .dom()
      .hasText(
        'isLoading: false; error: Error: something failed;',
        'shows an error'
      );
  });
});
