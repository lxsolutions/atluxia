
const { resolve } = require('path');

module.exports = {
  extends: ['next', 'prettier'],
  parserOptions: {
    project: resolve(__dirname, 'tsconfig.json'),
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'prefer-const': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
};
