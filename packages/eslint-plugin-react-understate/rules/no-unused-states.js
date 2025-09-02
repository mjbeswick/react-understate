/**
 * @fileoverview ESLint rule to detect unused states
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Detect states that are created but never used",
      category: "React Understate",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noUnusedStates:
        'State "{{stateName}}" is created but never used. Remove it if not needed.',
    },
  },

  create(context) {
    const stateDeclarations = new Map(); // Track state declarations
    const stateUsages = new Set(); // Track state usage

    // Check if this is a state() call
    function isStateCall(node) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "state"
      );
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

    // Check if this is a useSubscribe call
    function isUseSubscribeCall(node) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "useSubscribe"
      );
    }

    return {
      // Track state declarations
      VariableDeclarator(node) {
        if (node.init && isStateCall(node.init)) {
          const stateName = node.id.name;
          stateDeclarations.set(stateName, {
            node,
            declared: true,
            used: false,
          });
        }
      },

      // Track state usage through .value access
      MemberExpression(node) {
        if (isStateValueAccess(node)) {
          const stateName = node.object.name;
          if (stateDeclarations.has(stateName)) {
            const stateInfo = stateDeclarations.get(stateName);
            stateInfo.used = true;
            stateDeclarations.set(stateName, stateInfo);
          }
        }
      },

      // Track state usage through useSubscribe
      CallExpression(node) {
        if (isUseSubscribeCall(node) && node.arguments.length > 0) {
          const arg = node.arguments[0];
          if (arg.type === "Identifier") {
            const stateName = arg.name;
            if (stateDeclarations.has(stateName)) {
              const stateInfo = stateDeclarations.get(stateName);
              stateInfo.used = true;
              stateDeclarations.set(stateName, stateInfo);
            }
          }
        }
      },

      // Track state usage through derived() dependencies
      CallExpression(node) {
        if (
          node.type === "CallExpression" &&
          node.callee.type === "Identifier" &&
          node.callee.name === "derived" &&
          node.arguments.length > 0
        ) {
          const derivedCallback = node.arguments[0];
          if (
            derivedCallback.type === "ArrowFunctionExpression" ||
            derivedCallback.type === "FunctionExpression"
          ) {
            // Check the derived callback for state usage
            const checkNode = (n) => {
              if (isStateValueAccess(n)) {
                const stateName = n.object.name;
                if (stateDeclarations.has(stateName)) {
                  const stateInfo = stateDeclarations.get(stateName);
                  stateInfo.used = true;
                  stateDeclarations.set(stateName, stateInfo);
                }
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

            // Check the derived callback body
            if (derivedCallback.body.type === "BlockStatement") {
              derivedCallback.body.body.forEach((statement) => {
                if (statement.type === "ExpressionStatement") {
                  checkNode(statement.expression);
                }
              });
            } else {
              checkNode(derivedCallback.body);
            }
          }
        }
      },

      // Report unused states at the end of the file
      "Program:exit"() {
        stateDeclarations.forEach((stateInfo, stateName) => {
          if (stateInfo.declared && !stateInfo.used) {
            context.report({
              node: stateInfo.node,
              messageId: "noUnusedStates",
              data: {
                stateName,
              },
            });
          }
        });
      },
    };
  },
};
