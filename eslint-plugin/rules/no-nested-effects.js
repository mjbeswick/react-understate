/**
 * @fileoverview ESLint rule to prevent nested effect() calls
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent nested effect() calls which can cause performance issues and unexpected behavior',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noNestedEffects:
        'Nested effect() calls are not allowed. Move the inner effect outside or combine them into a single effect.',
    },
  },

  create(context) {
    let effectDepth = 0;
    const isInEffect = false;

    function isEffectCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'effect'
      );
    }

    return {
      // Track when we enter an effect call
      CallExpression(node) {
        if (isEffectCall(node)) {
          effectDepth++;
          if (effectDepth > 1) {
            context.report({
              node,
              messageId: 'noNestedEffects',
            });
          }
        }
      },

      // Track when we exit an effect call
      'CallExpression:exit'(node) {
        if (isEffectCall(node)) {
          effectDepth--;
        }
      },

      // Track when we enter the effect callback function
      FunctionExpression(_node) {
        if (isInEffect) {
          // We're entering a nested function inside an effect
          // This is allowed, but we need to track it
        }
      },

      ArrowFunctionExpression(_node) {
        if (isInEffect) {
          // We're entering a nested arrow function inside an effect
          // This is allowed, but we need to track it
        }
      },
    };
  },
};
