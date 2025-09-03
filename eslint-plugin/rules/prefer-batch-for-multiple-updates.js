/**
 * @fileoverview ESLint rule to prefer batch() for multiple state updates
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer batch() for multiple state updates to avoid unnecessary re-renders',
      category: 'React Understate',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          minUpdates: {
            type: 'number',
            minimum: 2,
            default: 3,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferBatch:
        'Multiple state updates detected. Consider using batch() to group these updates: {{updates}}',
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
        node.type === 'AssignmentExpression' &&
        node.operator === '=' &&
        node.left.type === 'MemberExpression' &&
        node.left.property.type === 'Identifier' &&
        node.left.property.name === 'value' &&
        node.left.object.type === 'Identifier'
      );
    }

    function isAlreadyBatched(node) {
      // Check if this node is already inside a batch() call
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === 'CallExpression' &&
          parent.callee &&
          parent.callee.type === 'Identifier' &&
          parent.callee.name === 'batch'
        ) {
          return true;
        }
        parent = parent.parent;
      }
      return false;
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
          (node.init.type === 'ArrowFunctionExpression' ||
            node.init.type === 'FunctionExpression')
        ) {
          currentFunction = node.id?.name;
          stateUpdates.set(currentFunction, []);
        }
      },

      // Track assignment expressions
      AssignmentExpression(node) {
        if (isStateUpdate(node) && currentFunction && !isAlreadyBatched(node)) {
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
      'FunctionDeclaration:exit'(node) {
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
                .map(u => u.stateName)
                .join(', ');
              context.report({
                node: sortedUpdates[0].node,
                messageId: 'preferBatch',
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

      'VariableDeclarator:exit'(node) {
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
                .map(u => u.stateName)
                .join(', ');
              context.report({
                node: sortedUpdates[0].node,
                messageId: 'preferBatch',
                data: {
                  updates: updateNames,
                },
                fix(fixer) {
                  const sourceCode = context.getSourceCode();

                  // Find the common parent block that contains all updates
                  let commonParent = sortedUpdates[0].node.parent;
                  while (commonParent) {
                    if (
                      commonParent.type === 'BlockStatement' ||
                      commonParent.type === 'Program'
                    ) {
                      break;
                    }
                    commonParent = commonParent.parent;
                  }

                  if (!commonParent || commonParent.type === 'Program') {
                    // Can't safely fix at program level
                    return null;
                  }

                  // Get the range of all consecutive updates
                  const firstUpdate = sortedUpdates[0];
                  const lastUpdate = sortedUpdates[sortedUpdates.length - 1];

                  // Find the start of the first statement and end of the last statement
                  let start = firstUpdate.node.range[0];
                  let end = lastUpdate.node.range[1];

                  // Extend to include the full statements (including semicolons)
                  const firstToken = sourceCode.getFirstToken(firstUpdate.node);
                  const lastToken = sourceCode.getLastToken(lastUpdate.node);

                  if (firstToken && lastToken) {
                    start = firstToken.range[0];
                    end = lastToken.range[1];
                  }

                  // Get proper indentation from the first line
                  const firstLine = sourceCode.lines[firstUpdate.line - 1];
                  const indentation = firstLine.match(/^\s*/)[0];

                  // Get the original text and fix indentation
                  let originalText = sourceCode.text.slice(start, end);

                  // Fix indentation of the original text
                  const lines = originalText.split('\n');
                  const fixedLines = lines.map((line, index) => {
                    if (index === 0) return line; // First line doesn't need indentation fix
                    return indentation + '  ' + line.trim();
                  });
                  originalText = fixedLines.join('\n');

                  // Create the batch wrapper
                  const batchStart = `batch(() => {\n${indentation}  `;
                  const batchEnd = `\n${indentation}});`;

                  // Replace the original text with the batched version
                  return fixer.replaceTextRange(
                    [start, end],
                    batchStart + originalText + batchEnd
                  );
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
