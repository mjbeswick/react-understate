/**
 * @fileoverview ESLint rule to require state subscription cleanup
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require cleanup of state subscriptions to prevent memory leaks',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      requireStateSubscriptionCleanup:
        'State subscriptions should be cleaned up to prevent memory leaks. Store the unsubscribe function and call it when appropriate.',
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

    function isInsideEffectFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === 'ArrowFunctionExpression' ||
          parent.type === 'FunctionExpression'
        ) {
          // Check if this function is the first argument of an effect call
          let grandParent = parent.parent;
          if (
            grandParent &&
            grandParent.type === 'CallExpression' &&
            grandParent.callee &&
            grandParent.callee.type === 'Identifier' &&
            grandParent.callee.name === 'effect'
          ) {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    function isStateSubscription(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'subscribe' &&
        node.callee.object.type === 'MemberExpression' &&
        node.callee.object.property.type === 'Identifier' &&
        node.callee.object.property.name === 'value'
      );
    }

    function hasCleanupReturn(node) {
      // Find the effect function and check if it has any return statement
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === 'ArrowFunctionExpression' ||
          parent.type === 'FunctionExpression'
        ) {
          // Check if this function is the first argument of an effect call
          let grandParent = parent.parent;
          if (
            grandParent &&
            grandParent.type === 'CallExpression' &&
            grandParent.callee &&
            grandParent.callee.type === 'Identifier' &&
            grandParent.callee.name === 'effect'
          ) {
            // Check if this function has any return statement
            function hasReturn(n) {
              if (n.type === 'ReturnStatement') {
                return true;
              }
              if (n.body) {
                if (Array.isArray(n.body)) {
                  return n.body.some(hasReturn);
                } else {
                  return hasReturn(n.body);
                }
              }
              return false;
            }
            return hasReturn(parent);
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      // Check for state subscriptions without cleanup
      CallExpression(node) {
        if (
          isStateSubscription(node) &&
          isInsideEffectFunction(node) &&
          !hasCleanupReturn(node)
        ) {
          context.report({
            node,
            messageId: 'requireStateSubscriptionCleanup',
          });
        }
      },
    };
  },
};
