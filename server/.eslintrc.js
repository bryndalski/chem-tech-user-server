module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'nestjs',
    'jest',
    'unused-imports',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:nestjs/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    'package.js',
    'package-lock.json',
    '.eslintrc.js',
    '**/migrations/**',
  ],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    //jest plugin
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    //interface
    '@typescript-eslint/consistent-type-exports': 'warn',
    //naming
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: [
          'variable',
          'function',
          'classProperty',
          'objectLiteralProperty',
          'typeProperty',
          'classMethod',
        ],
        format: ['strictCamelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'variable',
        types: ['boolean'],
        prefix: ['is', 'should', 'has', 'can'],
        format: ['camelCase', 'UPPER_CASE'],
      },
      {
        selector: 'variable',
        types: ['boolean'],
        prefix: ['is', 'should', 'has', 'can'],
        format: ['camelCase', 'UPPER_CASE'],
      },
      {
        selector: ['enum', 'class'],
        format: ['PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
    ],
    //no console logs
    'no-console': 'error',
    //enum duplicates
    '@typescript-eslint/no-duplicate-enum-values': 'warn',
    //dynamic delete from object
    '@typescript-eslint/no-dynamic-delete': 'error',
    //empty interfaces
    '@typescript-eslint/no-empty-interface': 'error',
    //type ANY
    '@typescript-eslint/no-explicit-any': 'off',
    //promisses
    '@typescript-eslint/no-misused-promises': 'error',
    //unsave returns
    '@typescript-eslint/no-unsafe-return': 'error',
    //empty export
    '@typescript-eslint/no-useless-empty-export': 'error',
    //no vars allowed
    '@typescript-eslint/no-var-requires': 'error',
    //enum always with value
    '@typescript-eslint/prefer-enum-initializers': 'error',
    //for of in array
    '@typescript-eslint/prefer-for-of': 'warn',
    //requests function type
    '@typescript-eslint/prefer-function-type': 'error',
    //includes in array
    '@typescript-eslint/prefer-includes': 'warn',
    //require await in promisses
    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',
    //unused imports and vars
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'error',
    //template expressions
    '@typescript-eslint/restrict-template-expressions': 'off',
    //unsave assigments
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    'nestjs/use-validation-pipe': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
};
