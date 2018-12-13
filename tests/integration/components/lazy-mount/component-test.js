import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { timeout } from 'ember-concurrency';

module('Integration | Component | lazy-mount', function(hooks) {
  setupRenderingTest(hooks);

  test('it works', async function(assert) {
    await render(hbs`
      <LazyMount @name="an-engine" as |e|>
        isLoading: {{e.isLoading}};
        error: {{e.error}};
      </LazyMount>
    `);

    assert.dom().hasText('isLoading: true; error: ;');

    await settled();

    assert.dom().hasText('Hello from the other side.');
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

    await settled();
  });

  test('it shows an error, if the promise rejects', async function(assert) {
    class AssetLoaderService extends Service {
      async loadBundle() {
        await timeout(10);
        throw new Error('something failed');
      }
    }
    this.owner.unregister('service:asset-loader');
    this.owner.register('service:asset-loader', AssetLoaderService);

    await render(hbs`
      <LazyMount @name="an-engine" as |e|>
        isLoading: {{e.isLoading}};
        error: {{e.error}};
      </LazyMount>
    `);

    // assert.dom().hasText('isLoading: true; error: ;');

    await settled();

    assert.dom().hasText('isLoading: false; error: Error: something failed;');

    await settled();
  });
});
