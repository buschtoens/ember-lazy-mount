# ember-lazy-mount

[![CI](https://github.com/buschtoens/ember-lazy-mount/workflows/CI/badge.svg)](https://github.com/buschtoens/ember-lazy-mount/actions)
[![npm version](https://badge.fury.io/js/ember-lazy-mount.svg)](http://badge.fury.io/js/ember-lazy-mount)
[![Download Total](https://img.shields.io/npm/dt/ember-lazy-mount.svg)](http://badge.fury.io/js/ember-lazy-mount)
[![Ember Observer Score](https://emberobserver.com/badges/ember-lazy-mount.svg)](https://emberobserver.com/addons/ember-lazy-mount)
[![Ember Versions](https://img.shields.io/badge/Ember.js%20Versions-%5E4.12-brightgreen.svg)](https://github.com/buschtoens/ember-lazy-mount/actions)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)  
[![Dependabot enabled](https://img.shields.io/badge/dependabot-enabled-blue.svg?logo=dependabot)](https://dependabot.com/)
[![Dependencies](https://img.shields.io/librariesio/github/buschtoens/ember-lazy-mount)](https://libraries.io/github/buschtoens/ember-lazy-mount)

`{{mount}}` lazy loading route-less engines.

## Compatibility

- Ember.js v4.12 or above
- Embroider or ember-auto-import v2

## Installation

```
ember install ember-lazy-mount
```

## Usage

### `{{lazy-mount}}` Component

- **`name`**: _`string`_ — The name of the engine to load
- **`model?`**: _`any`_ — Optional model that will be passed through to the engine

The `{{lazy-mount}}` component works just like the [`{{mount}}` helper](https://emberjs.com/api/ember/3.5/classes/Ember.Templates.helpers/methods/mount?anchor=mount).
It accepts the name of the engine as a positional parameter and also an optional
`model` parameter.

As soon as the helper is rendered, it will begin loading the specified engine.
If the engine is already loaded, it will be mounted immediately.

The `engineName` and `model` parameters are dynamic and you can update them.
Setting a new `engineName` will cause the new engine to be loaded and mounted.

#### Inline Usage

While the engine is loading, nothing is rendered. If there was an error loading
the engine, nothing is rendered.

```hbs
{{lazy-mount engineName model=optionalDataForTheEngine}}
```

You can also pass three optional hooks:

```hbs
{{lazy-mount
  this.engineName
  onLoad=this.onLoad
  didLoad=this.didLoad
  onError=this.onError
}}
```

- **`onLoad()`** — Called when the engine starts loading
- **`didLoad()`** — Called when the engine loaded successfully
- **`onError(error: Error)`** — Called when the engine failed to load

#### Block Usage

While the engine is loading or if there was an error loading the engine, the
block that is passed to the component is rendered. The `engine` block parameter
is an object with two properties:

- **`isLoading`**: _`boolean`_ — Whether or not the engine is currently loading
- **`error`**: _`Error | null`_ — If there was an error loading the engine

When the engine was loaded successfully, the passed in block is replaced by the
engine.

```hbs
{{#lazy-mount engineName model=optionalDataForTheEngine as |engine|}}
  {{#if engine.isLoading}}
    🕑 The engine is loading...
  {{else if engine.error}}
    😨 There was an error loading the engine:
    <code>{{engine.error}}</code>
  {{/if}}
{{/lazy-mount}}
```

You can also pass in the same hooks: `onLoad`, `didLoad`, `onError`

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
