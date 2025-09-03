module.exports = {
  rules: {
    'require-use-subscribe': require('./rules/require-use-subscribe'),
    'prefer-batch-for-multiple-updates': require('./rules/prefer-batch-for-multiple-updates'),
    'no-direct-state-assignment': require('./rules/no-direct-state-assignment'),
    'require-use-subscribe-for-all-states': require('./rules/require-use-subscribe-for-all-states'),
    'prefer-derived-for-computed': require('./rules/prefer-derived-for-computed'),
    'no-state-creation-in-components': require('./rules/no-state-creation-in-components'),
    'prefer-effect-for-side-effects': require('./rules/prefer-effect-for-side-effects'),
    'no-unused-states': require('./rules/no-unused-states'),
    'require-error-handling-in-async-updates': require('./rules/require-error-handling-in-async-updates'),
    'prefer-object-spread-for-updates': require('./rules/prefer-object-spread-for-updates'),
    'no-nested-effects': require('./rules/no-nested-effects'),
    'no-nested-derived': require('./rules/no-nested-derived'),
  },
  configs: {
    recommended: {
      plugins: ['react-understate'],
      rules: {
        // Error rules - these are critical for correct usage
        'react-understate/require-use-subscribe-for-all-states': 'error',
        'react-understate/no-direct-state-assignment': 'error',
        'react-understate/no-state-creation-in-components': 'error',
        'react-understate/no-nested-effects': 'error',
        'react-understate/no-nested-derived': 'error',

        // Warning rules - these are best practices but not critical
        'react-understate/prefer-derived-for-computed': 'warn',
        'react-understate/prefer-effect-for-side-effects': 'warn',
        'react-understate/no-unused-states': 'warn',
        'react-understate/require-error-handling-in-async-updates': 'warn',
        'react-understate/prefer-object-spread-for-updates': 'warn',
        'react-understate/prefer-batch-for-multiple-updates': 'warn',
      },
    },
  },
};
