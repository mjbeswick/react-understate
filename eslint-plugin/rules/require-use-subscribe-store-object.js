/**
 * @fileoverview ESLint rule to ensure useUnderstate is called when using store objects in React components
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require useUnderstate when using store objects in React components',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingUseSubscribeStore:
        'Store object "{{storeName}}" is used but not subscribed to. Add useUnderstate({{storeName}}) to subscribe to state changes.',
      invalidStoreUsage:
        'Store object "{{storeName}}" should be used with useUnderstate. Use const { ... } = useUnderstate({{storeName}}) to get current values.',
    },
  },

  create(context) {
    const storeUsages = new Set();
    const useUnderstateCalls = new Set();
    let isInReactComponent = false;

    // Check if we're in a React component function
    function isReactComponent(node) {
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'VariableDeclarator'
      ) {
        const name = node.id?.name || node.init?.id?.name;
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

    // Check if a variable is likely a store object (has properties that look like states)
    function isLikelyStoreObject(node) {
      if (node.type === 'Identifier') {
        // This is a simple heuristic - in practice, you might want to track
        // actual store object definitions
        return true;
      }
      return false;
    }

    return {
      // Track function declarations and variable declarations
      FunctionDeclaration(node) {
        if (isReactComponent(node)) {
          isInReactComponent = true;
        }
      },

      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          isReactComponent(node)
        ) {
          isInReactComponent = true;
        }
      },

      // Track useUnderstate calls with store objects
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useUnderstate'
        ) {
          // Check if it's a store object call (single argument that's an identifier)
          if (
            node.arguments.length === 1 &&
            node.arguments[0].type === 'Identifier'
          ) {
            useUnderstateCalls.add(node.arguments[0].name);
          }
        }
      },

      // Track store object usage patterns
      MemberExpression(node) {
        if (node.object.type === 'Identifier') {
          const storeName = node.object.name;

          // Check if we're accessing a property that looks like a state value
          // (not .value, but direct property access)
          if (
            node.property.type === 'Identifier' &&
            node.property.name !== 'value' &&
            isInReactComponent &&
            isInFunction(node)
          ) {
            // This could be a store object usage
            if (!useUnderstateCalls.has(storeName)) {
              storeUsages.add(storeName);
            }
          }
        }
      },

      // Track destructuring patterns that might be store objects
      ObjectPattern(node) {
        if (isInReactComponent && isInFunction(node)) {
          // Check if this is part of a variable declaration with useUnderstate
          const parent = node.parent;
          if (
            parent.type === 'VariableDeclarator' &&
            parent.init &&
            parent.init.type === 'CallExpression' &&
            parent.init.callee.type === 'Identifier' &&
            parent.init.callee.name === 'useUnderstate'
          ) {
            // This is a valid useUnderstate store object usage
            if (parent.init.arguments.length === 1) {
              const storeName = parent.init.arguments[0].name;
              if (storeName) {
                useUnderstateCalls.add(storeName);
              }
            }
          }
        }
      },

      // Report issues when leaving a component
      'FunctionDeclaration:exit'(node) {
        if (isReactComponent(node)) {
          storeUsages.forEach(storeName => {
            if (!useUnderstateCalls.has(storeName)) {
              context.report({
                node,
                messageId: 'missingUseSubscribeStore',
                data: {
                  storeName,
                },
              });
            }
          });

          isInReactComponent = false;
          storeUsages.clear();
          useUnderstateCalls.clear();
        }
      },

      'VariableDeclarator:exit'(node) {
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          isReactComponent(node)
        ) {
          storeUsages.forEach(storeName => {
            if (!useUnderstateCalls.has(storeName)) {
              context.report({
                node,
                messageId: 'missingUseSubscribeStore',
                data: {
                  storeName,
                },
              });
            }
          });

          isInReactComponent = false;
          storeUsages.clear();
          useUnderstateCalls.clear();
        }
      },
    };
  },
};
