module.exports = {
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  root: true,
  env: {
    node: true,
    jest: true,
    es2020: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/', 'coverage/'],
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};
