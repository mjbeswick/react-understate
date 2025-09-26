import requireUseSubscribe from './rules/require-use-subscribe.cjs';
import requireUseSubscribeStoreObject from './rules/require-use-subscribe-store-object.cjs';
import preferBatchForMultipleUpdates from './rules/prefer-batch-for-multiple-updates.cjs';
import noDirectStateAssignment from './rules/no-direct-state-assignment.cjs';
import requireUseSubscribeForAllStates from './rules/require-use-subscribe-for-all-states.cjs';
import preferDerivedForComputed from './rules/prefer-derived-for-computed.cjs';
import noStateCreationInComponents from './rules/no-state-creation-in-components.cjs';
import preferEffectForSideEffects from './rules/prefer-effect-for-side-effects.cjs';
import noUnusedStates from './rules/no-unused-states.cjs';
import requireErrorHandlingInAsyncUpdates from './rules/require-error-handling-in-async-updates.cjs';
import noNestedEffects from './rules/no-nested-effects.cjs';
import noNestedDerived from './rules/no-nested-derived.cjs';
import noLibraryFunctionsInActions from './rules/no-library-functions-in-actions.cjs';
import noStateCreationInEffects from './rules/no-state-creation-in-effects.cjs';
import noDerivedCreationInEffects from './rules/no-derived-creation-in-effects.cjs';
import noStateUpdatesInDerived from './rules/no-state-updates-in-derived.cjs';
import noEffectCreationInDerived from './rules/no-effect-creation-in-derived.cjs';
import requireErrorHandlingInEffects from './rules/require-error-handling-in-effects.cjs';
import noDirectStateMutation from './rules/no-direct-state-mutation.cjs';
import noUnusedActionParameters from './rules/no-unused-action-parameters.cjs';
import requireStateSubscriptionCleanup from './rules/require-state-subscription-cleanup.cjs';
import requireValidStateName from './rules/require-valid-state-name.cjs';
import noBatchInEffects from './rules/no-batch-in-effects.cjs';
import noNestedUnderstateFunctions from './rules/no-nested-understate-functions.cjs';
import requireFullReactiveAccess from './rules/require-full-reactive-access.cjs';
import noStateUpdatesInEffects from './rules/no-state-updates-in-effects.cjs';

export default {
  rules: {
    'require-use-subscribe': requireUseSubscribe,
    'require-use-subscribe-store-object': requireUseSubscribeStoreObject,
    'prefer-batch-for-multiple-updates': preferBatchForMultipleUpdates,
    'no-direct-state-assignment': noDirectStateAssignment,
    'require-use-subscribe-for-all-states': requireUseSubscribeForAllStates,
    'prefer-derived-for-computed': preferDerivedForComputed,
    'no-state-creation-in-components': noStateCreationInComponents,
    'prefer-effect-for-side-effects': preferEffectForSideEffects,
    'no-unused-states': noUnusedStates,
    'require-error-handling-in-async-updates':
      requireErrorHandlingInAsyncUpdates,
    'no-nested-effects': noNestedEffects,
    'no-nested-derived': noNestedDerived,
    'no-library-functions-in-actions': noLibraryFunctionsInActions,
    'no-state-creation-in-effects': noStateCreationInEffects,
    'no-derived-creation-in-effects': noDerivedCreationInEffects,
    'no-state-updates-in-derived': noStateUpdatesInDerived,
    'no-effect-creation-in-derived': noEffectCreationInDerived,
    'require-error-handling-in-effects': requireErrorHandlingInEffects,
    'no-direct-state-mutation': noDirectStateMutation,
    'no-unused-action-parameters': noUnusedActionParameters,
    'require-state-subscription-cleanup': requireStateSubscriptionCleanup,
    'require-valid-state-name': requireValidStateName,
    'no-batch-in-effects': noBatchInEffects,
    'no-nested-understate-functions': noNestedUnderstateFunctions,
    'require-full-reactive-access': requireFullReactiveAccess,
    'no-state-updates-in-effects': noStateUpdatesInEffects,
  },
  configs: {
    recommended: {
      plugins: ['react-understate'],
      rules: {
        // Error rules - these are critical for correct usage
        'react-understate/require-use-subscribe-for-all-states': 'error',
        'react-understate/require-use-subscribe-store-object': 'error',
        'react-understate/no-direct-state-assignment': 'error',
        'react-understate/no-state-creation-in-components': 'error',
        'react-understate/no-nested-effects': 'error',
        'react-understate/no-nested-derived': 'error',
        'react-understate/no-library-functions-in-actions': 'error',
        'react-understate/no-state-creation-in-effects': 'error',
        'react-understate/no-derived-creation-in-effects': 'error',
        'react-understate/no-state-updates-in-derived': 'error',
        'react-understate/no-effect-creation-in-derived': 'error',
        'react-understate/require-error-handling-in-effects': 'warn',
        'react-understate/no-direct-state-mutation': 'error',
        'react-understate/no-unused-action-parameters': 'warn',
        'react-understate/require-state-subscription-cleanup': 'warn',
        'react-understate/require-valid-state-name': 'error',
        'react-understate/no-batch-in-effects': 'warn',
        'react-understate/no-nested-understate-functions': 'error',
        'react-understate/require-full-reactive-access': 'warn',
        'react-understate/no-state-updates-in-effects': 'warn',

        // Warning rules - these are best practices but not critical
        'react-understate/prefer-derived-for-computed': 'warn',
        'react-understate/prefer-effect-for-side-effects': 'warn',
        'react-understate/no-unused-states': 'warn',
        'react-understate/require-error-handling-in-async-updates': 'warn',
        'react-understate/prefer-batch-for-multiple-updates': 'warn',
      },
    },
  },
};
