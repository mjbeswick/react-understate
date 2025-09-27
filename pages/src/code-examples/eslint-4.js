// Flat config snippet
export default [
  {
    rules: {
      'react-understate/require-use-subscribe-for-all-states': 'error',
      'react-understate/require-use-subscribe-store-object': 'error',
      'react-understate/no-state-creation-in-components': 'error',
      'react-understate/no-direct-state-mutation': 'error',
      'react-understate/prefer-batch-for-multiple-updates': [
        'warn',
        { minUpdates: 2 },
      ],
    },
  },
];
