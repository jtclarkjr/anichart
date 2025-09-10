export default {
  customSyntax: 'postcss-html',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html',
    'stylelint-config-recess-order',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue'
  ],
  ignoreFiles: ['dist/**/*', 'coverage/**/*', '**/*.html']
}
