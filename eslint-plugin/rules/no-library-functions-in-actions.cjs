/**
 * @fileoverview ESLint rule to prevent using library functions directly in actions
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent using library functions (state, derived, effect, batch) directly in actions',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noLibraryFunctionInAction:
        'Avoid using {{functionName}} directly in actions. Actions should only contain state updates and business logic.',
    },
  },

  create(context) {
    const libraryFunctions = new Set(['state', 'derived', 'effect', 'batch']);
    let isInsideAction = false;
    let actionName = null;

    function isActionCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'action'
      );
    }

    function isLibraryFunctionCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        libraryFunctions.has(node.callee.name)
      );
    }

    function isInsideActionFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
          // Check if this function is the first argument of an action call
          let grandParent = parent.parent;
          if (grandParent && grandParent.type === 'CallExpression' && 
              grandParent.callee && grandParent.callee.type === 'Identifier' && 
              grandParent.callee.name === 'action') {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
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

    function isStateAccess(node) {
      // Check if this is accessing state.value
      return (
        node.type === 'MemberExpression' &&
        node.property.type === 'Identifier' &&
        node.property.name === 'value' &&
        node.object.type === 'Identifier'
      );
    }

    function isAllowedInAction(node) {
      // State updates and state access are allowed
      if (isStateUpdate(node) || isStateAccess(node)) {
        return true;
      }

      // Variable declarations are allowed
      if (node.type === 'VariableDeclaration') {
        return true;
      }

      // Return statements are allowed
      if (node.type === 'ReturnStatement') {
        return true;
      }

      // If statements, loops, etc. are allowed
      if (['IfStatement', 'ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement'].includes(node.type)) {
        return true;
      }

      // Expression statements that are not library function calls are allowed
      if (node.type === 'ExpressionStatement') {
        return !isLibraryFunctionCall(node.expression);
      }

      // Block statements are allowed (they contain other statements)
      if (node.type === 'BlockStatement') {
        return true;
      }

      // Function calls that are not library functions are allowed
      if (node.type === 'CallExpression') {
        return !isLibraryFunctionCall(node);
      }

      // Member expressions (like object.property) are allowed
      if (node.type === 'MemberExpression') {
        return true;
      }

      // Identifiers are allowed
      if (node.type === 'Identifier') {
        return true;
      }

      // Literals are allowed
      if (node.type === 'Literal') {
        return true;
      }

      // Binary expressions are allowed
      if (node.type === 'BinaryExpression') {
        return true;
      }

      // Unary expressions are allowed
      if (node.type === 'UnaryExpression') {
        return true;
      }

      // Conditional expressions are allowed
      if (node.type === 'ConditionalExpression') {
        return true;
      }

      // Array expressions are allowed
      if (node.type === 'ArrayExpression') {
        return true;
      }

      // Object expressions are allowed
      if (node.type === 'ObjectExpression') {
        return true;
      }

      // Arrow function expressions are allowed
      if (node.type === 'ArrowFunctionExpression') {
        return true;
      }

      // Function expressions are allowed
      if (node.type === 'FunctionExpression') {
        return true;
      }

      // Assignment expressions are allowed (including state updates)
      if (node.type === 'AssignmentExpression') {
        return true;
      }

      // Update expressions (++, --) are allowed
      if (node.type === 'UpdateExpression') {
        return true;
      }

      // Logical expressions (&&, ||) are allowed
      if (node.type === 'LogicalExpression') {
        return true;
      }

      // Sequence expressions (comma operator) are allowed
      if (node.type === 'SequenceExpression') {
        return true;
      }

      // Template literals are allowed
      if (node.type === 'TemplateLiteral') {
        return true;
      }

      // Tagged template expressions are allowed
      if (node.type === 'TaggedTemplateExpression') {
        return true;
      }

      // New expressions are allowed
      if (node.type === 'NewExpression') {
        return true;
      }

      // Yield expressions are allowed
      if (node.type === 'YieldExpression') {
        return true;
      }

      // Await expressions are allowed
      if (node.type === 'AwaitExpression') {
        return true;
      }

      // Spread elements are allowed
      if (node.type === 'SpreadElement') {
        return true;
      }

      // Rest elements are allowed
      if (node.type === 'RestElement') {
        return true;
      }

      // Default case - allow other node types
      return true;
    }

    return {
      // Track when we enter an action call
      CallExpression(node) {
        if (isActionCall(node)) {
          isInsideAction = true;
          // Try to get the action name from the variable it's assigned to
          if (node.parent && node.parent.type === 'VariableDeclarator') {
            actionName = node.parent.id?.name;
          } else if (node.parent && node.parent.type === 'AssignmentExpression') {
            actionName = node.parent.left?.name;
          } else {
            actionName = 'anonymous action';
          }
        }
      },

      // Check for library function calls inside actions
      CallExpression(node) {
        if (isLibraryFunctionCall(node) && isInsideActionFunction(node)) {
          context.report({
            node,
            messageId: 'noLibraryFunctionInAction',
            data: {
              functionName: node.callee.name,
            },
          });
        }
      },

      // Track when we exit an action call
      'CallExpression:exit'(node) {
        if (isActionCall(node)) {
          isInsideAction = false;
          actionName = null;
        }
      },
    };
  },
};
