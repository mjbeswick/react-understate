/**
 * @fileoverview ESLint rule to prevent effect creation in derived values
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description:
        'Prevent effect creation inside derived values as they should be pure functions',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noEffectCreationInDerived:
        'Derived values should be pure functions. Avoid creating effects inside derived values.',
    },
  },

  create(context) {
    function isDerivedCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'derived'
      );
    }

    function isEffectCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'effect'
      );
    }

    function isInsideDerivedFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
          // Check if this function is the first argument of a derived call
          let grandParent = parent.parent;
          if (grandParent && grandParent.type === 'CallExpression' && 
              grandParent.callee && grandParent.callee.type === 'Identifier' && 
              grandParent.callee.name === 'derived') {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      // Check for effect creation inside derived values
      CallExpression(node) {
        if (isEffectCall(node) && isInsideDerivedFunction(node)) {
          context.report({
            node,
            messageId: 'noEffectCreationInDerived',
          });
        }
      },
    };
  },
};
