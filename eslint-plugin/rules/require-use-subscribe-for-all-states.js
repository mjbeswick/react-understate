/**
 * @fileoverview ESLint rule to require useUnderstate for all states used in React components
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure all states used in a React component are properly subscribed to',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingUseSubscribe:
        'State "{{stateName}}" is used but not subscribed to. Add useUnderstate({{stateName}}) to subscribe to state changes.',
    },
  },

  create(context) {
    const stateUsages = new Map();
    const useUnderstateCalls = new Set();
    const storeObjectCalls = new Set();
    let isInReactComponent = false;
    let currentFunctionName = null;

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
          currentFunctionName = node.id?.name;
          stateUsages.set(currentFunctionName, new Set());
          useUnderstateCalls.clear();
        }
      },

      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          isReactComponent(node)
        ) {
          isInReactComponent = true;
          currentFunctionName = node.id?.name;
          stateUsages.set(currentFunctionName, new Set());
          useUnderstateCalls.clear();
        }
      },

      // Track useUnderstate calls
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useUnderstate'
        ) {
          // Check if it's a store object call (single argument)
          if (
            node.arguments.length === 1 &&
            node.arguments[0].type === 'Identifier'
          ) {
            // This is a store object call
            storeObjectCalls.add(node.arguments[0].name);
            return;
          }

          // Check all arguments for individual state subscriptions
          node.arguments.forEach(arg => {
            if (arg.type === 'Identifier') {
              useUnderstateCalls.add(arg.name);
            }
          });
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
              // Skip if this state is part of a store object that's being used
              if (currentFunctionName && !useUnderstateCalls.has(stateName)) {
                // Check if this state might be part of a store object
                let isPartOfStore = false;
                for (const storeName of storeObjectCalls) {
                  // This is a heuristic - if the state name is used in a store object call,
                  // we assume it's part of that store
                  if (storeName && storeName !== stateName) {
                    isPartOfStore = true;
                    break;
                  }
                }

                if (!isPartOfStore) {
                  const usages =
                    stateUsages.get(currentFunctionName) || new Set();
                  usages.add(stateName);
                  stateUsages.set(currentFunctionName, usages);
                }
              }
            }
          }
        }
      },

      // Report missing useUnderstate calls when leaving a component
      'FunctionDeclaration:exit'(node) {
        if (isReactComponent(node)) {
          const functionName = node.id?.name;
          if (functionName && stateUsages.has(functionName)) {
            const usages = stateUsages.get(functionName);
            usages.forEach(stateName => {
              if (!useUnderstateCalls.has(stateName)) {
                context.report({
                  node,
                  messageId: 'missingUseSubscribe',
                  data: {
                    stateName,
                  },
                });
              }
            });
            stateUsages.delete(functionName);
          }
          isInReactComponent = false;
          currentFunctionName = null;
          useUnderstateCalls.clear();
          storeObjectCalls.clear();
        }
      },

      'VariableDeclarator:exit'(node) {
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          isReactComponent(node)
        ) {
          const functionName = node.id?.name;
          if (functionName && stateUsages.has(functionName)) {
            const usages = stateUsages.get(functionName);
            usages.forEach(stateName => {
              if (!useUnderstateCalls.has(stateName)) {
                context.report({
                  node,
                  messageId: 'missingUseSubscribe',
                  data: {
                    stateName,
                  },
                });
              }
            });
            stateUsages.delete(functionName);
          }
          isInReactComponent = false;
          currentFunctionName = null;
          useUnderstateCalls.clear();
          storeObjectCalls.clear();
        }
      },
    };
  },
};
