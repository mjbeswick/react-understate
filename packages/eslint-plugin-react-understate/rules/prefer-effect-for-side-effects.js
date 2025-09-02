/**
 * @fileoverview ESLint rule to prefer effect() over useEffect() for state-related side effects
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer effect() over useEffect() for state-related side effects",
      category: "React Understate",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      preferEffectForSideEffects:
        "Consider using effect() instead of useEffect() for state-related side effects. This provides better integration with the reactive system.",
    },
  },

  create(context) {
    let isInReactComponent = false;
    let currentFunctionName = null;
    const stateUsages = new Set();

    // Check if we're in a React component function
    function isReactComponent(node) {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "VariableDeclarator"
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
          current.type === "FunctionDeclaration" ||
          current.type === "FunctionExpression" ||
          current.type === "ArrowFunctionExpression"
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    // Check if this is a state.value access
    function isStateValueAccess(node) {
      return (
        node.type === "MemberExpression" &&
        node.property.type === "Identifier" &&
        node.property.name === "value" &&
        node.object.type === "Identifier"
      );
    }

    // Check if this is a useEffect call
    function isUseEffectCall(node) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "useEffect"
      );
    }

    // Check if the useEffect callback uses state values
    function usesStateValues(node) {
      let usesState = false;

      const checkNode = (n) => {
        if (isStateValueAccess(n)) {
          usesState = true;
        }
        if (n.type === "BinaryExpression") {
          checkNode(n.left);
          checkNode(n.right);
        }
        if (n.type === "CallExpression") {
          n.arguments.forEach(checkNode);
        }
        if (n.type === "ConditionalExpression") {
          checkNode(n.test);
          checkNode(n.consequent);
          checkNode(n.alternate);
        }
        if (n.type === "LogicalExpression") {
          checkNode(n.left);
          checkNode(n.right);
        }
        if (n.type === "UnaryExpression") {
          checkNode(n.argument);
        }
        if (n.type === "MemberExpression") {
          checkNode(n.object);
          if (n.property) checkNode(n.property);
        }
      };

      checkNode(node);
      return usesState;
    }

    return {
      // Track function declarations
      FunctionDeclaration(node) {
        if (isReactComponent(node)) {
          isInReactComponent = true;
          currentFunctionName = node.id?.name;
          stateUsages.clear();
        }
      },

      // Track arrow functions and function expressions
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === "ArrowFunctionExpression" &&
          isReactComponent(node)
        ) {
          isInReactComponent = true;
          currentFunctionName = node.id?.name;
          stateUsages.clear();
        }
      },

      // Track state.value usage
      MemberExpression(node) {
        if (
          isStateValueAccess(node) &&
          isInReactComponent &&
          isInFunction(node)
        ) {
          stateUsages.add(node.object.name);
        }
      },

      // Check for useEffect calls that could use effect()
      CallExpression(node) {
        if (isUseEffectCall(node) && isInReactComponent && isInFunction(node)) {
          // Check if the useEffect callback uses state values
          if (node.arguments.length > 0 && usesStateValues(node.arguments[0])) {
            context.report({
              node,
              messageId: "preferEffectForSideEffects",
            });
          }
        }
      },

      // Reset when leaving a component
      "FunctionDeclaration:exit"(node) {
        if (isReactComponent(node)) {
          isInReactComponent = false;
          currentFunctionName = null;
          stateUsages.clear();
        }
      },

      "VariableDeclarator:exit"(node) {
        if (
          node.init &&
          node.init.type === "ArrowFunctionExpression" &&
          isReactComponent(node)
        ) {
          isInReactComponent = false;
          currentFunctionName = null;
          stateUsages.clear();
        }
      },
    };
  },
};
