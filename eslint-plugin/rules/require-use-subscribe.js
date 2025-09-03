/**
 * @fileoverview ESLint rule to ensure useUnderstate is called when state.value is used in React components
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require useUnderstate when state.value is used in React components',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingUseSubscribe:
        'Missing useUnderstate call for state "{{stateName}}". Add useUnderstate({{stateName}}) to subscribe to state changes.',
    },
  },

  create(context) {
    const _stateUsages = new Map();
    const useUnderstateCalls = new Set();
    let isInReactComponent = false;
    let _currentFunctionName = null;

    // Check if we're in a React component function
    function isReactComponent(node) {
      // Check if it's a function declaration or arrow function
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'VariableDeclarator'
      ) {
        const name = node.id?.name || node.init?.id?.name;
        // React components typically start with uppercase
        return name && /^[A-Z]/.test(name);
      }
      return false;
    }

    // Check if we're in a function that could be a React component
    function isInFunction(node) {
      let current = node;
      while (current) {
        if (
          current.type === 'FunctionDeclaration' ||
          current.type === 'FunctionExpression' ||
          current.type === 'ArrowFunctionExpression'
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    return {
      // Track function declarations and variable declarations (for arrow functions)
      FunctionDeclaration(node) {
        if (isReactComponent(node)) {
          isInReactComponent = true;
          _currentFunctionName = node.id?.name;
        }
      },

      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          isReactComponent(node)
        ) {
          isInReactComponent = true;
          _currentFunctionName = node.id?.name;
        }
      },

      // Track useUnderstate calls
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useUnderstate'
        ) {
          if (
            node.arguments.length > 0 &&
            node.arguments[0].type === 'Identifier'
          ) {
            useUnderstateCalls.add(node.arguments[0].name);
          }
        }
      },

      // Track state.value usage
      MemberExpression(node) {
        if (
          node.property.type === 'Identifier' &&
          node.property.name === 'value'
        ) {
          if (node.object.type === 'Identifier') {
            const stateName = node.object.name;

            // Only check if we're in a React component function
            if (isInReactComponent && isInFunction(node)) {
              if (!useUnderstateCalls.has(stateName)) {
                context.report({
                  node,
                  messageId: 'missingUseSubscribe',
                  data: {
                    stateName,
                  },
                });
              }
            }
          }
        }
      },

      // Reset when leaving a component
      'FunctionDeclaration:exit'(node) {
        if (isReactComponent(node)) {
          isInReactComponent = false;
          _currentFunctionName = null;
          useUnderstateCalls.clear();
        }
      },

      'VariableDeclarator:exit'(node) {
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          isReactComponent(node)
        ) {
          isInReactComponent = false;
          _currentFunctionName = null;
          useUnderstateCalls.clear();
        }
      },
    };
  },
};
