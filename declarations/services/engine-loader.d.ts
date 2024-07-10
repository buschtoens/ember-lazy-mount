import Service from '@ember/service';
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
    isLoaded(name: string): boolean;
    /**
     * Registers an Engine that was recently loaded.
     *
     * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L166-L182
     *
     * @param {String} name
     */
    register(name: string): void;
    /**
     * Loads and registers a lazy Engine.
     *
     * @param {String} name
     * @async
     */
    load(name: string): Promise<void>;
}
//# sourceMappingURL=engine-loader.d.ts.map