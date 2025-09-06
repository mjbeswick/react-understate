/**
 * @fileoverview ESLint rule to prevent nested derived() calls
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent nested derived() calls which can cause performance issues and unexpected behavior',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noNestedDerived:
        'Nested derived() calls are not allowed. Move the inner derived outside or combine them into a single derived.',
    },
  },

  create(context) {
    let derivedDepth = 0;

    function isDerivedCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'derived'
      );
    }

    return {
      // Track when we enter a derived call
      CallExpression(node) {
        if (isDerivedCall(node)) {
          derivedDepth++;
          if (derivedDepth > 1) {
            context.report({
              node,
              messageId: 'noNestedDerived',
            });
          }
        }
      },

      // Track when we exit a derived call
      'CallExpression:exit'(node) {
        if (isDerivedCall(node)) {
          derivedDepth--;
        }
      },
    };
  },
};
