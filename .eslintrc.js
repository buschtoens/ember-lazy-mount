const fromPairs = require('lodash.frompairs');

module.exports = {
  root: true,
  parser: 'eslint-plugin-typescript/parser',
  plugins: ['typescript', 'ember', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'ember/named-functions-in-promises': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'typescript/no-unused-vars': 'error'
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
        'lib/*/index.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign(
        {},
        require('eslint-plugin-node').configs.recommended.rules,
        fromPairs(
          Object.keys(
            require('eslint-plugin-ember').configs.recommended.rules
          ).map(k => [k, 'off'])
        ),
        {
          // add your custom rules and overrides for node files here
        }
      )
    }
  ]
};
