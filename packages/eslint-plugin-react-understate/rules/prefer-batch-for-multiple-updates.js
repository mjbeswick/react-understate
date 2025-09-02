/**
 * @fileoverview ESLint rule to prefer batch() for multiple state updates
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer batch() for multiple state updates to avoid unnecessary re-renders",
      category: "React Understate",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          minUpdates: {
            type: "number",
            minimum: 2,
            default: 3,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferBatch:
        "Multiple state updates detected. Consider using batch() to group these updates: {{updates}}",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const minUpdates = options.minUpdates || 3;

    const stateUpdates = new Map(); // Track updates per function
    let currentFunction = null;

    function isStateUpdate(node) {
      // Check if this is a state.value = ... assignment
      return (
        node.type === "AssignmentExpression" &&
        node.operator === "=" &&
        node.left.type === "MemberExpression" &&
        node.left.property.type === "Identifier" &&
        node.left.property.name === "value" &&
        node.left.object.type === "Identifier"
      );
    }

    function getStateName(node) {
      return node.left.object.name;
    }

    return {
      // Track function declarations
      FunctionDeclaration(node) {
        currentFunction = node.id?.name;
        stateUpdates.set(currentFunction, []);
      },

      // Track arrow functions and function expressions
      VariableDeclarator(node) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          currentFunction = node.id?.name;
          stateUpdates.set(currentFunction, []);
        }
      },

      // Track assignment expressions
      AssignmentExpression(node) {
        if (isStateUpdate(node) && currentFunction) {
          const updates = stateUpdates.get(currentFunction) || [];
          updates.push({
            node,
            stateName: getStateName(node),
            line: node.loc.start.line,
          });
          stateUpdates.set(currentFunction, updates);
        }
      },

      // Check for multiple updates when leaving a function
      "FunctionDeclaration:exit"(node) {
        const functionName = node.id?.name;
        if (functionName && stateUpdates.has(functionName)) {
          const updates = stateUpdates.get(functionName);
          if (updates.length >= minUpdates) {
            // Check if updates are consecutive (within reasonable proximity)
            const sortedUpdates = updates.sort((a, b) => a.line - b.line);
            const isConsecutive = sortedUpdates.every((update, index) => {
              if (index === 0) return true;
              return update.line - sortedUpdates[index - 1].line <= 5; // Within 5 lines
            });

            if (isConsecutive) {
              const updateNames = sortedUpdates
                .map((u) => u.stateName)
                .join(", ");
              context.report({
                node: sortedUpdates[0].node,
                messageId: "preferBatch",
                data: {
                  updates: updateNames,
                },
                fix(fixer) {
                  const firstUpdate = sortedUpdates[0];
                  const lastUpdate = sortedUpdates[sortedUpdates.length - 1];

                  // Get the text range for all updates
                  const start = firstUpdate.node.range[0];
                  const end = lastUpdate.node.range[1];

                  // Get the indentation of the first update
                  const sourceCode = context.getSourceCode();
                  const firstLine = sourceCode.lines[firstUpdate.line - 1];
                  const indentation = firstLine.match(/^\s*/)[0];

                  // Create the batch wrapper
                  const batchStart = `batch(() => {\n${indentation}  `;
                  const batchEnd = `\n${indentation}});`;

                  // Get the original text and wrap it
                  const originalText = sourceCode.text.slice(start, end);
                  const wrappedText = batchStart + originalText + batchEnd;

                  return fixer.replaceTextRange([start, end], wrappedText);
                },
              });
            }
          }
          stateUpdates.delete(functionName);
        }
        currentFunction = null;
      },

      "VariableDeclarator:exit"(node) {
        const functionName = node.id?.name;
        if (functionName && stateUpdates.has(functionName)) {
          const updates = stateUpdates.get(functionName);
          if (updates.length >= minUpdates) {
            const sortedUpdates = updates.sort((a, b) => a.line - b.line);
            const isConsecutive = sortedUpdates.every((update, index) => {
              if (index === 0) return true;
              return update.line - sortedUpdates[index - 1].line <= 5;
            });

            if (isConsecutive) {
              const updateNames = sortedUpdates
                .map((u) => u.stateName)
                .join(", ");
              context.report({
                node: sortedUpdates[0].node,
                messageId: "preferBatch",
                data: {
                  updates: updateNames,
                },
                fix(fixer) {
                  const firstUpdate = sortedUpdates[0];
                  const lastUpdate = sortedUpdates[sortedUpdates.length - 1];

                  const start = firstUpdate.node.range[0];
                  const end = lastUpdate.node.range[1];

                  const sourceCode = context.getSourceCode();
                  const firstLine = sourceCode.lines[firstUpdate.line - 1];
                  const indentation = firstLine.match(/^\s*/)[0];

                  const batchStart = `batch(() => {\n${indentation}  `;
                  const batchEnd = `\n${indentation}});`;

                  const originalText = sourceCode.text.slice(start, end);
                  const wrappedText = batchStart + originalText + batchEnd;

                  return fixer.replaceTextRange([start, end], wrappedText);
                },
              });
            }
          }
          stateUpdates.delete(functionName);
        }
        currentFunction = null;
      },
    };
  },
};
