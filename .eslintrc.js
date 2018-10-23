/**
 * @fileoverview ESLint configuration for all source, test and config files.
 * @author Milos Djermanovic
 */

'use strict';

module.exports = {
  extends: 'eslint:recommended',

  plugins: ['prettier'],

  parserOptions: {
    ecmaVersion: 6,
  },

  env: {
    es6: true,
    node: true,
  },

  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': ['error', 'unix'],
    eqeqeq: 'error',
    'valid-jsdoc': 'error',
  },

  overrides: [
    {
      files: 'test/**',
      env: {
        mocha: true,
      },
    },
  ],
};
