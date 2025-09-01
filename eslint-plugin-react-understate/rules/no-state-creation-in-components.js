/**
 * @fileoverview ESLint rule to prevent state creation inside React components
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent creating states inside React components, which can cause issues with re-renders',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noStateCreationInComponent: 'Do not create states inside React components. Move state creation outside the component to avoid re-creation on every render.',
    },
  },

  create(context) {
    let isInReactComponent = false;
    let currentFunctionName = null;

    // Check if we're in a React component function
    function isReactComponent(node) {
      if (node.type === 'FunctionDeclaration' || node.type === 'VariableDeclarator') {
        const name = node.id?.name || node.init?.id?.name;
        return name && /^[A-Z]/.test(name);
      }
      return false;
    }

    // Check if we're in a function that could be a React component
    function isInFunction(node) {
      let current = node;
      while (current) {
        if (current.type === 'FunctionDeclaration' || 
            current.type === 'FunctionExpression' ||
            current.type === 'ArrowFunctionExpression') {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    // Check if this is a state() call
    function isStateCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'state'
      );
    }

    return {
      // Track function declarations
      FunctionDeclaration(node) {
        if (isReactComponent(node)) {
          isInReactComponent = true;
          currentFunctionName = node.id?.name;
        }
      },

      // Track arrow functions and function expressions
      VariableDeclarator(node) {
        if (node.init && node.init.type === 'ArrowFunctionExpression' && isReactComponent(node)) {
          isInReactComponent = true;
          currentFunctionName = node.id?.name;
        }
      },

      // Check for state creation inside components
      CallExpression(node) {
        if (isStateCall(node) && isInReactComponent && isInFunction(node)) {
          context.report({
            node,
            messageId: 'noStateCreationInComponent',
          });
        }
      },

      // Reset when leaving a component
      'FunctionDeclaration:exit'(node) {
        if (isReactComponent(node)) {
          isInReactComponent = false;
          currentFunctionName = null;
        }
      },

      'VariableDeclarator:exit'(node) {
        if (node.init && node.init.type === 'ArrowFunctionExpression' && isReactComponent(node)) {
          isInReactComponent = false;
          currentFunctionName = null;
        }
      },
    };
  },
};
