module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    'no-empty-source': null,
    'no-descending-specificity': null,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ],
    'selector-pseudo-class-no-unknown': null,
    'selector-class-pattern': null,
    'declaration-empty-line-before': null,
    'at-rule-no-unknown': null,
    'property-no-unknown': null
  }
}
