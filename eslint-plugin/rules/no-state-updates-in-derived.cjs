/**
 * @fileoverview ESLint rule to prevent state updates in derived values
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description:
        'Prevent state updates inside derived values as they should be pure functions',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noStateUpdatesInDerived:
        'Derived values should be pure functions. Avoid state updates inside derived values.',
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

    function isStateUpdate(node) {
      // Check if this is a state.value = ... assignment
      return (
        node.type === 'AssignmentExpression' &&
        node.operator === '=' &&
        node.left.type === 'MemberExpression' &&
        node.left.property.type === 'Identifier' &&
        node.left.property.name === 'value' &&
        node.left.object.type === 'Identifier'
      );
    }

    function isStateMethodCall(node) {
      // Check if this is a state.update() call
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'update' &&
        node.callee.object.type === 'Identifier'
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
      // Check for state updates inside derived values
      AssignmentExpression(node) {
        if (isStateUpdate(node) && isInsideDerivedFunction(node)) {
          context.report({
            node,
            messageId: 'noStateUpdatesInDerived',
          });
        }
      },

      // Check for state method calls inside derived values
      CallExpression(node) {
        if (isStateMethodCall(node) && isInsideDerivedFunction(node)) {
          context.report({
            node,
            messageId: 'noStateUpdatesInDerived',
          });
        }
      },
    };
  },
};
