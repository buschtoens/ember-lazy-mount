# ember-lazy-mount

[![Build Status](https://travis-ci.org/buschtoens/ember-lazy-mount.svg)](https://travis-ci.org/buschtoens/ember-lazy-mount)
[![npm version](https://badge.fury.io/js/ember-lazy-mount.svg)](http://badge.fury.io/js/ember-lazy-mount)
[![Download Total](https://img.shields.io/npm/dt/ember-lazy-mount.svg)](http://badge.fury.io/js/ember-lazy-mount)
[![Ember Observer Score](https://emberobserver.com/badges/ember-lazy-mount.svg)](https://emberobserver.com/addons/ember-lazy-mount)
[![Ember Versions](https://img.shields.io/badge/Ember.js%20Versions-%5E2.12%20%7C%7C%20%5E3.0-brightgreen.svg)](https://travis-ci.org/buschtoens/ember-lazy-mount)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![dependencies](https://img.shields.io/david/buschtoens/ember-lazy-mount.svg)](https://david-dm.org/buschtoens/ember-lazy-mount)
[![devDependencies](https://img.shields.io/david/dev/buschtoens/ember-lazy-mount.svg)](https://david-dm.org/buschtoens/ember-lazy-mount)

## Installation

```
ember install ember-lazy-mount
```

## Usage

### `{{lazy-mount}}` Component

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

#### Block Usage

While the engine is loading or if there was an error loading the engine, the
block that is passed to the component is rendered. The `engine` block parameter
is an object with two properties:

- **`isLoading`**: *`boolean`* — Whether or not the engine is currently loading
- **`error`**: *`Error | null`* — If there was an error loading the engine

When the engine was loaded successfully, the passed in block is replaced by the
engine.

```hbs
{{#lazy-mount engineName model=optionalDataForTheEngine as |engine|}}
  {{#if engine.isLoading}}
    🕑 The engine is loading...
  {{else if engines.error}}
    😨 There was an error loading the engine:
    <code>{{engine.error}}</code>
  {{/if}}
{{/lazy-mount}}
```
