'use strict';

/**
 * @fileoverview Require full reactive access in derived functions
 *
 * This rule detects when reactive values are accessed with nested properties
 * inside derived functions, which doesn't create proper subscriptions.
 *
 * The issue occurs when you do:
 * ```typescript
 * derived(() => {
 *   return items.value.map(item => ({
 *     ...item,
 *     nested: reactiveValue.value[item.id] // ❌ No subscription created
 *   }));
 * });
 * ```
 *
 * Instead, you should:
 * ```typescript
 * derived(() => {
 *   const reactive = reactiveValue.value; // ✅ Creates subscription
 *   return items.value.map(item => ({
 *     ...item,
 *     nested: reactive[item.id]
 *   }));
 * });
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require full reactive access in derived functions to ensure proper subscriptions',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireFullReactiveAccess:
        'Reactive value "{{reactiveName}}" is accessed with nested properties inside derived function. This doesn\'t create a subscription. Extract the full value first: `const {{varName}} = {{reactiveName}}.value;`',
    },
  },

  create(context) {
    const derivedCallStack = [];
    const reactiveValuePattern = /\.value$/;

    function isDerivedCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'derived'
      );
    }

    function isReactiveValue(node) {
      return (
        node.type === 'MemberExpression' &&
        node.property.type === 'Identifier' &&
        node.property.name === 'value' &&
        node.object.type === 'Identifier'
      );
    }

    function isNestedPropertyAccess(node) {
      return (
        node.type === 'MemberExpression' &&
        node.object.type === 'MemberExpression' &&
        node.object.property.type === 'Identifier' &&
        node.object.property.name === 'value'
      );
    }

    function getReactiveName(node) {
      if (node.object.type === 'Identifier') {
        return node.object.name;
      }
      return null;
    }

    function getSuggestedVarName(reactiveName) {
      // Convert camelCase to snake_case or use a simple mapping
      const commonMappings = {
        imageCache: 'cache',
        userData: 'user',
        productList: 'products',
        itemMap: 'items',
        configData: 'config',
        stateData: 'state',
      };

      return commonMappings[reactiveName] || reactiveName.toLowerCase();
    }

    return {
      CallExpression(node) {
        if (isDerivedCall(node)) {
          derivedCallStack.push(node);
        }
      },

      'CallExpression:exit'(node) {
        if (isDerivedCall(node)) {
          derivedCallStack.pop();
        }
      },

      MemberExpression(node) {
        // Only check inside derived functions
        if (derivedCallStack.length === 0) {
          return;
        }

        // Check if this is a nested property access on a reactive value
        if (isNestedPropertyAccess(node)) {
          const reactiveName = getReactiveName(node.object);

          if (reactiveName) {
            const suggestedVarName = getSuggestedVarName(reactiveName);

            context.report({
              node,
              messageId: 'requireFullReactiveAccess',
              data: {
                reactiveName,
                varName: suggestedVarName,
              },
              fix(fixer) {
                // Find the derived function body
                const derivedCall =
                  derivedCallStack[derivedCallStack.length - 1];
                const derivedFunction = derivedCall.arguments[0];

                if (derivedFunction.type !== 'ArrowFunctionExpression') {
                  return null; // Can't fix non-arrow functions easily
                }

                const functionBody = derivedFunction.body;
                const sourceCode = context.getSourceCode();
                const functionText = sourceCode.getText(functionBody);

                // Check if the variable is already declared
                if (
                  functionText.includes(
                    `const ${suggestedVarName} = ${reactiveName}.value`,
                  )
                ) {
                  // Variable already exists, just replace the usage
                  const fullReactiveAccess = `${reactiveName}.value`;
                  const replacement = suggestedVarName;

                  // Replace the nested access with the variable
                  return fixer.replaceText(node, replacement);
                }

                // Add the variable declaration and replace the usage
                const newVarDeclaration = `const ${suggestedVarName} = ${reactiveName}.value;\n`;

                if (functionBody.type === 'BlockStatement') {
                  // Add at the beginning of the block
                  const firstStatement = functionBody.body[0];
                  if (firstStatement) {
                    // Add variable declaration
                    const addVar = fixer.insertTextBefore(
                      firstStatement,
                      newVarDeclaration,
                    );
                    // Replace the nested access with the variable
                    const replaceUsage = fixer.replaceText(
                      node,
                      suggestedVarName,
                    );
                    return [addVar, replaceUsage];
                  } else {
                    // Empty block, add before the closing brace
                    const addVar = fixer.insertTextBeforeRange(
                      [functionBody.range[1] - 1, functionBody.range[1] - 1],
                      newVarDeclaration,
                    );
                    const replaceUsage = fixer.replaceText(
                      node,
                      suggestedVarName,
                    );
                    return [addVar, replaceUsage];
                  }
                } else {
                  // Expression body, wrap in block and add variable
                  const expressionText = sourceCode.getText(functionBody);
                  const newBody = `{\n${newVarDeclaration}return ${expressionText};\n}`;
                  return fixer.replaceText(functionBody, newBody);
                }
              },
            });
          }
        }
      },
    };
  },
};
