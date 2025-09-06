/**
 * @fileoverview ESLint rule to prevent unused action parameters
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent unused parameters in action functions',
      category: 'React Understate',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noUnusedActionParameters:
        'Action parameter "{{paramName}}" is defined but never used. Consider removing it or prefixing with underscore.',
    },
  },

  create(context) {
    function isActionCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'action'
      );
    }

    function isInsideActionFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
          // Check if this function is the first argument of an action call
          let grandParent = parent.parent;
          if (grandParent && grandParent.type === 'CallExpression' && 
              grandParent.callee && grandParent.callee.type === 'Identifier' && 
              grandParent.callee.name === 'action') {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    function getActionParameters(node) {
      if (isActionCall(node) && node.arguments.length > 0) {
        const func = node.arguments[0];
        if (func && (func.type === 'ArrowFunctionExpression' || func.type === 'FunctionExpression')) {
          return func.params || [];
        }
      }
      return [];
    }

    function isParameterUsage(node, paramName) {
      return (
        node.type === 'Identifier' &&
        node.name === paramName &&
        !node.name.startsWith('_') &&
        isInsideActionFunction(node)
      );
    }

    return {
      // Check for unused parameters in action calls
      CallExpression(node) {
        if (isActionCall(node)) {
          const params = getActionParameters(node);
          const func = node.arguments[0];
          
          if (func && (func.type === 'ArrowFunctionExpression' || func.type === 'FunctionExpression')) {
            // Check each parameter
            params.forEach(param => {
              if (param.type === 'Identifier' && !param.name.startsWith('_')) {
                // Check if this parameter is used in the function body
                let isUsed = false;
                
                // Simple check - look for identifier usage in the function body
                function checkNode(n) {
                  if (!n || typeof n !== 'object') return;
                  
                  // Skip parameter declarations
                  if (n.type === 'Identifier' && n.name === param.name && n !== param) {
                    isUsed = true;
                    return;
                  }
                  
                  // Recursively check all properties
                  for (const key in n) {
                    if (key === 'parent' || key === 'range' || key === 'loc') continue;
                    const value = n[key];
                    if (Array.isArray(value)) {
                      value.forEach(checkNode);
                    } else if (value && typeof value === 'object') {
                      checkNode(value);
                    }
                  }
                }
                
                checkNode(func);
                
                if (!isUsed) {
                  context.report({
                    node: param,
                    messageId: 'noUnusedActionParameters',
                    data: {
                      paramName: param.name,
                    },
                    fix(fixer) {
                      return fixer.replaceText(param, `_${param.name}`);
                    },
                  });
                }
              }
            });
          }
        }
      },
    };
  },
};
