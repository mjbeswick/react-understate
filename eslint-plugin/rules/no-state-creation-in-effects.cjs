/**
 * @fileoverview ESLint rule to prevent state creation in effects
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent creating new states inside effects to avoid memory leaks',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noStateCreationInEffect:
        'Avoid creating new states inside effects. This can cause memory leaks as the effect may run multiple times.',
    },
  },

  create(context) {
    function isEffectCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'effect'
      );
    }

    function isStateCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'state'
      );
    }

    function isInsideEffectFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
          // Check if this function is the first argument of an effect call
          let grandParent = parent.parent;
          if (grandParent && grandParent.type === 'CallExpression' && 
              grandParent.callee && grandParent.callee.type === 'Identifier' && 
              grandParent.callee.name === 'effect') {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      // Check for state creation inside effects
      CallExpression(node) {
        if (isStateCall(node) && isInsideEffectFunction(node)) {
          context.report({
            node,
            messageId: 'noStateCreationInEffect',
          });
        }
      },
    };
  },
};
