/* eslint-disable ember/no-runloop */
import {
  clearRender,
  find,
  render,
  resetOnerror,
  settled,
  setupOnerror,
  waitUntil,
} from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { defer } from 'rsvp';

module('Integration | Component | lazy-mount', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    this.onError = () => assert.step('onError');
    this.onLoad = () => assert.step('onLoad');
    this.didLoad = () => assert.step('didLoad');
  });

  const TEMPLATE = hbs`
    <div data-test-result>
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
    </div>
  `;

  test('it works', async function (assert) {
    this.engineName = 'test-engine1';

    await render(TEMPLATE);

    assert.verifySteps(['onLoad', 'didLoad']);
    assert
      .dom()
      .hasText('Hello from the other side.', 'shows the engine template');
  });

  test('it mounts engine multiple times', async function (assert) {
    this.engineName = 'test-engine1';

    await render(TEMPLATE);

    assert.verifySteps(['onLoad', 'didLoad']);
    assert
      .dom()
      .hasText('Hello from the other side.', 'shows the engine template');

    await clearRender();
    assert.dom().hasText('', 'shows nothing');

    await render(TEMPLATE);

    assert.verifySteps(['onLoad', 'didLoad']);
    assert
      .dom()
      .hasText('Hello from the other side.', 'shows the engine template again');
  });

  test('it mounts different engines', async function (assert) {
    this.engineName = 'test-engine1';

    await render(TEMPLATE);

    assert.verifySteps(['onLoad', 'didLoad']);
    assert
      .dom()
      .hasText('Hello from the other side.', 'shows the engine1 template');

    this.set('engineName', 'test-engine2');
    await settled();

    assert.verifySteps(['onLoad', 'didLoad']);
    assert
      .dom()
      .hasText('Hello from the another side.', 'shows the engine2 template');
  });

  test('it throws an error right away for a non-existing engine', async function (assert) {
    this.engineName = 'not-an-engine';

    await render(TEMPLATE);

    assert
      .dom()
      .hasText(
        'isLoading: false; error: Error: Assertion Failed: No bundle with name "not-an-engine" exists in the asset manifest.;',
      );
    assert.verifySteps(['onLoad', 'onError']);
  });

  test('it shows a loading state and an error', async function (assert) {
    const deferred = defer();
    class AssetLoaderService extends Service {
      loadBundle() {
        return deferred.promise;
      }
    }
    this.owner.unregister('service:asset-loader');
    this.owner.register('service:asset-loader', AssetLoaderService);

    this.engineName = 'test-engine1';

    render(TEMPLATE);

    await waitUntil(() =>
      find('[data-test-result]').textContent.includes('isLoading: true'),
    );
    assert.dom().hasText('isLoading: true; error: ;', 'shows a loading state');
    assert.verifySteps(['onLoad']);

    deferred.reject(new Error('something failed'));
    await settled();

    assert.verifySteps(['onError']);
    assert
      .dom()
      .hasText(
        'isLoading: false; error: Error: something failed;',
        'shows an error',
      );
  });

  test("it throws an error for missing 'name' argument", async function (assert) {
    assert.expect(1);

    setupOnerror(function (err) {
      assert.ok(err, 'Error thrown during rendering');
    });

    this.engineName = '';

    await render(TEMPLATE);

    resetOnerror();
  });
});
