import Service from '@ember/service';

export default class AssetLoaderService extends Service {
  loadBundle<Name extends string>(name: Name): Promise<Name>;
}
