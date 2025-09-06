/**
 * @fileoverview ESLint rule to require error handling in async state updates
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure async state updates have proper error handling',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      requireErrorHandlingInAsyncUpdates:
        'Async state update should include error handling. Consider wrapping the update in a try-catch block or using proper error handling.',
    },
  },

  create(context) {
    // Check if this is a state.update() call
    function isStateUpdateCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'update' &&
        node.callee.object.type === 'Identifier'
      );
    }

    // Check if the update callback is async
    function isAsyncCallback(node) {
      if (node.arguments.length === 0) return false;

      const callback = node.arguments[0];
      if (
        callback.type === 'ArrowFunctionExpression' ||
        callback.type === 'FunctionExpression'
      ) {
        return callback.async === true;
      }
      return false;
    }

    // Check if the async callback has error handling
    function hasErrorHandling(node) {
      if (node.arguments.length === 0) return false;

      const callback = node.arguments[0];
      if (
        callback.type === 'ArrowFunctionExpression' ||
        callback.type === 'FunctionExpression'
      ) {
        return hasTryCatchInFunction(callback);
      }
      return false;
    }

    // Recursively check for try-catch blocks in a function
    function hasTryCatchInFunction(node) {
      if (!node.body) return false;

      const body = node.body;
      if (body.type === 'BlockStatement') {
        return body.body.some(statement => {
          if (statement.type === 'TryStatement') {
            return true;
          }
          if (statement.type === 'IfStatement') {
            // Check for error handling patterns like if (error) or if (result.error)
            return isErrorHandlingCondition(statement.test);
          }
          return false;
        });
      }
      return false;
    }

    // Check if a condition suggests error handling
    function isErrorHandlingCondition(node) {
      if (node.type === 'Identifier') {
        return node.name === 'error' || node.name === 'err';
      }
      if (node.type === 'MemberExpression') {
        return (
          node.property.type === 'Identifier' &&
          (node.property.name === 'error' || node.property.name === 'status')
        );
      }
      if (node.type === 'BinaryExpression') {
        return (
          node.operator === '!==' ||
          node.operator === '!=' ||
          node.operator === '===' ||
          node.operator === '=='
        );
      }
      return false;
    }

    return {
      CallExpression(node) {
        if (
          isStateUpdateCall(node) &&
          isAsyncCallback(node) &&
          !hasErrorHandling(node)
        ) {
          context.report({
            node,
            messageId: 'requireErrorHandlingInAsyncUpdates',
          });
        }
      },
    };
  },
};
