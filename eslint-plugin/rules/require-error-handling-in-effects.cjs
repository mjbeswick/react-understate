/**
 * @fileoverview ESLint rule to require error handling in effects
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require error handling for async operations in effects',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      requireErrorHandlingInEffect:
        'Effects with async operations should include error handling to prevent unhandled promise rejections.',
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

    function isAsyncOperation(node) {
      // Check for await expressions
      if (node.type === 'AwaitExpression') {
        return true;
      }

      // Check for Promise methods
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'Promise' &&
        node.callee.property.type === 'Identifier' &&
        ['then', 'catch', 'finally', 'all', 'race', 'allSettled'].includes(
          node.callee.property.name,
        )
      ) {
        return true;
      }

      // Check for fetch calls
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'fetch'
      ) {
        return true;
      }

      return false;
    }

    function hasErrorHandling(node) {
      // Check if any parent is a try statement with catch
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'TryStatement' && parent.handler) {
          return true;
        }
        parent = parent.parent;
      }

      // Check for promise catch
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'catch'
      ) {
        return true;
      }

      return false;
    }

    return {
      // Check for async operations without error handling
      CallExpression(node) {
        if (
          isAsyncOperation(node) &&
          isInsideEffectFunction(node) &&
          !hasErrorHandling(node)
        ) {
          context.report({
            node,
            messageId: 'requireErrorHandlingInEffect',
          });
        }
      },

      // Check for await expressions without error handling
      AwaitExpression(node) {
        if (isInsideEffectFunction(node) && !hasErrorHandling(node)) {
          context.report({
            node,
            messageId: 'requireErrorHandlingInEffect',
          });
        }
      },
    };
  },
};
