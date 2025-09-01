/**
 * @fileoverview ESLint rule to prefer object spread for state updates
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer immutable updates for object states using object spread',
      category: 'React Understate',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferObjectSpreadForUpdates: 'Prefer immutable object updates using spread operator instead of direct property assignment.',
    },
  },

  create(context) {
    // Check if this is a state.value.property assignment
    function isStatePropertyAssignment(node) {
      return (
        node.type === 'AssignmentExpression' &&
        node.operator === '=' &&
        node.left.type === 'MemberExpression' &&
        node.left.object.type === 'MemberExpression' &&
        node.left.object.property.type === 'Identifier' &&
        node.left.object.property.name === 'value' &&
        node.left.object.object.type === 'Identifier'
      );
    }

    // Check if this is a state.value.property.property assignment (nested)
    function isNestedStatePropertyAssignment(node) {
      if (node.type !== 'AssignmentExpression' || node.operator !== '=') {
        return false;
      }

      let current = node.left;
      let hasValueProperty = false;
      let hasStateObject = false;

      while (current && current.type === 'MemberExpression') {
        if (current.property.type === 'Identifier' && current.property.name === 'value') {
          hasValueProperty = true;
        }
        if (current.object.type === 'Identifier') {
          hasStateObject = true;
        }
        current = current.object;
      }

      return hasValueProperty && hasStateObject && node.left.type === 'MemberExpression';
    }

    // Check if the state is likely an object (heuristic)
    function isLikelyObjectState(stateName) {
      // This is a heuristic - we could make this more sophisticated
      // by tracking state declarations and their types
      const objectStatePatterns = [
        /user/i, /data/i, /config/i, /settings/i, /form/i, /item/i, /object/i,
        /state/i, /props/i, /options/i, /params/i, /query/i, /filter/i
      ];
      
      return objectStatePatterns.some(pattern => pattern.test(stateName));
    }

    return {
      AssignmentExpression(node) {
        if (isStatePropertyAssignment(node) || isNestedStatePropertyAssignment(node)) {
          // Extract the state name
          let current = node.left;
          let stateName = null;
          
          while (current && current.type === 'MemberExpression') {
            if (current.property.type === 'Identifier' && current.property.name === 'value') {
              if (current.object.type === 'Identifier') {
                stateName = current.object.name;
                break;
              }
            }
            current = current.object;
          }

          if (stateName && isLikelyObjectState(stateName)) {
            context.report({
              node,
              messageId: 'preferObjectSpreadForUpdates',
              fix(fixer) {
                // This is a complex fix that would require more sophisticated analysis
                // For now, we'll just report the issue without auto-fixing
                return null;
              },
            });
          }
        }
      },
    };
  },
};
