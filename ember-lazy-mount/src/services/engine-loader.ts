import Service from '@ember/service';
import { getOwner } from '@ember/owner';

import type Owner from '@ember/owner';

type ExtendedOwner = Owner & {
  hasRegistration(name: string): boolean;
};

export default class EngineLoaderService extends Service {
  /**
   * Checks the owner to see if it has a registration for an Engine. This is a
   * proxy to tell if an Engine's assets are loaded or not.
   *
   * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L152-L164
   *
   * @param {String} name
   * @return {Boolean}
   */
  isLoaded(name: string) {
    const owner = <ExtendedOwner>getOwner(this);
    return Boolean(owner?.hasRegistration(`engine:${name}`));
  }

  /**
   * Registers an Engine that was recently loaded.
   *
   * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L166-L182
   *
   * @param {String} name
   */
  register(name: string) {
    if (this.isLoaded(name)) return;

    const owner = getOwner(this);
    owner?.register(
      `engine:${name}`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globalThis.require(`${name}/engine`).default,
    );
  }

  /**
   * Loads and registers a lazy Engine.
   *
   * @param {String} name
   * @async
   */
  async load(name: string) {
    if (this.isLoaded(name)) return;

    const assetLoader = getOwner(this)?.lookup('service:asset-loader');
    await assetLoader?.loadBundle(name);
    this.register(name);
  }
}
