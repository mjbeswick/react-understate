module.exports = {
  rules: {
    "require-use-subscribe": require("./rules/require-use-subscribe"),
    "prefer-batch-for-multiple-updates": require("./rules/prefer-batch-for-multiple-updates"),
    "no-direct-state-assignment": require("./rules/no-direct-state-assignment"),
    "require-use-subscribe-for-all-states": require("./rules/require-use-subscribe-for-all-states"),
    "prefer-derived-for-computed": require("./rules/prefer-derived-for-computed"),
    "no-state-creation-in-components": require("./rules/no-state-creation-in-components"),
    "prefer-effect-for-side-effects": require("./rules/prefer-effect-for-side-effects"),
    "no-unused-states": require("./rules/no-unused-states"),
    "require-error-handling-in-async-updates": require("./rules/require-error-handling-in-async-updates"),
    "prefer-object-spread-for-updates": require("./rules/prefer-object-spread-for-updates"),
    "no-nested-effects": require("./rules/no-nested-effects"),
    "no-nested-derived": require("./rules/no-nested-derived"),
  },
};
