const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules', 'dist']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2021,
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        module: 'writable',
        require: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  }
];
