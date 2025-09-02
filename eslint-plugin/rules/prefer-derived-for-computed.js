/**
 * @fileoverview ESLint rule to prefer derived() for computed values
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer derived() for computed values instead of manual computations in components",
      category: "React Understate",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      preferDerivedForComputed:
        "Consider using derived() for this computation instead of calculating it in the component. This will improve performance and ensure proper reactivity.",
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

    // Check if this is a computation that could benefit from derived()
    function isComputation(node) {
      // Look for mathematical operations, array methods, object property access, etc.
      if (node.type === "BinaryExpression") {
        return true;
      }
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee.type === "MemberExpression") {
          const methodName = callee.property.name;
          // Common array methods that suggest computation
          const computationMethods = [
            "map",
            "filter",
            "reduce",
            "find",
            "some",
            "every",
            "slice",
            "join",
          ];
          return computationMethods.includes(methodName);
        }
      }
      if (node.type === "ConditionalExpression") {
        return true;
      }
      return false;
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

      // Check for computations that could use derived()
      VariableDeclarator(node) {
        if (
          isInReactComponent &&
          isInFunction(node) &&
          node.init &&
          isComputation(node.init)
        ) {
          // Check if the computation uses any state values
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
          };

          checkNode(node.init);

          if (usesState) {
            context.report({
              node,
              messageId: "preferDerivedForComputed",
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
