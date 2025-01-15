import tseslint, { parser } from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/build/**', '**/dist/**'],
  },
  tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: { parser: parser },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
    }
  }
);
