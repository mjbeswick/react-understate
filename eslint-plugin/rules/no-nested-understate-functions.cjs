/**
 * @fileoverview Prevents any understate function calls inside other understate functions
 */

const UNDERSTATE_FUNCTIONS = [
  'state',
  'derived',
  'asyncDerived',
  'effect',
  'action',
  'batch',
  'persistLocalStorage',
  'persistSessionStorage',
  'persistStates',
  'configureDebug',
];

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent any understate function calls inside other understate functions',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noNestedUnderstate: 'Do not call understate functions inside other understate functions. Keep understate functions at the top level.',
    },
  },

  create(context) {
    let understateFunctionStack = [];

    return {
      // Track when we enter an understate function
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          UNDERSTATE_FUNCTIONS.includes(node.callee.name)
        ) {
          if (understateFunctionStack.length > 0) {
            context.report({
              node,
              messageId: 'noNestedUnderstate',
            });
          }
          understateFunctionStack.push(node.callee.name);
        }
      },

      // Track when we exit an understate function
      'CallExpression:exit'(node) {
        if (
          node.callee.type === 'Identifier' &&
          UNDERSTATE_FUNCTIONS.includes(node.callee.name)
        ) {
          understateFunctionStack.pop();
        }
      },

      // Track when we enter function bodies - these are the contexts where nesting would occur
      FunctionExpression(node) {
        // Function expressions are often passed as callbacks to understate functions
        // We need to track the nesting level
      },

      'FunctionExpression:exit'(node) {
        // Clean up when exiting function expressions
      },

      // Track when we enter arrow function bodies - these are often passed as callbacks
      ArrowFunctionExpression(node) {
        // Arrow functions are often passed as callbacks to understate functions
        // We need to track the nesting level
      },

      'ArrowFunctionExpression:exit'(node) {
        // Clean up when exiting arrow functions
      },
    };
  },
};
