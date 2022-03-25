module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier' // eslint-config-prettier 缩写
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  // eslint-plugin-vue @typescript-eslint/eslint-plugin eslint-plugin-prettier 缩写
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  globals: {},
  rules: {
    'prettier/prettier': [2, { endOfLine: 'lf', bracketSameLine: true }],
    'vue/no-unused-components': 0,
    'vue/no-unused-vars': 0,
    'vue/no-v-for-template-key-on-child': 0,
    'vue/no-v-model-argument': 0,
    'vue/no-multiple-template-root': 0,
    'vue/no-v-for-template-key': 0,
    'vue/multi-word-component-names': 0,
    'vue/no-dupe-keys': 0,
    'vue/valid-v-slot': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'no-param-reassign': 0
  }
}
