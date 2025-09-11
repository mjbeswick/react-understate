/**
 * @fileoverview ESLint rule to prevent direct state assignment which breaks reactivity
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent assigning state objects to variables, which breaks reactivity',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noDirectStateAssignment:
        'Do not assign state objects to variables. This breaks reactivity. Pass the state object itself instead.',
      noDirectStateValueAssignment:
        'Do not assign state values to variables. This breaks reactivity. Access the state.value directly when needed.',
    },
  },

  create(context) {
    function isStateVariable(node) {
      // Check if this variable is assigned a state object
      if (node.init && node.init.type === 'CallExpression') {
        const callee = node.init.callee;
        return callee.type === 'Identifier' && callee.name === 'state';
      }
      return false;
    }

    function isStateValueAccess(node) {
      // Check if this is accessing state.value
      return (
        node.type === 'MemberExpression' &&
        node.property.type === 'Identifier' &&
        node.property.name === 'value' &&
        node.object.type === 'Identifier'
      );
    }

    function isStateVariableName(name) {
      // Simple heuristic: check if variable name ends with common state patterns
      // This avoids complex scope analysis that can break with ESLint v9
      const statePatterns = [
        /^[a-z][a-zA-Z]*State$/,
        /^[a-z][a-zA-Z]*Cache$/,
        /^[a-z][a-zA-Z]*Data$/,
        /^[a-z][a-zA-Z]*List$/,
        /^[a-z][a-zA-Z]*Map$/,
        /^[a-z][a-zA-Z]*Store$/,
        /^[a-z][a-zA-Z]*Value$/,
      ];
      
      return statePatterns.some(pattern => pattern.test(name));
    }

    return {
      // Check for state object assignments and state value assignments
      VariableDeclarator(node) {
        // Check for state object assignments
        if (isStateVariable(node)) {
          context.report({
            node,
            messageId: 'noDirectStateAssignment',
            data: {
              variableName: node.id.name,
            },
          });
        }

        // Check for variable declarations with state values
        if (node.init && isStateValueAccess(node.init)) {
          const stateName = node.init.object.name;
          if (isStateVariableName(stateName)) {
            context.report({
              node,
              messageId: 'noDirectStateValueAssignment',
              data: {
                stateName,
                variableName: node.id.name,
              },
            });
          }
        }
      },

      // Check for state value assignments
      AssignmentExpression(node) {
        if (node.left.type === 'Identifier' && isStateValueAccess(node.right)) {
          const stateName = node.right.object.name;
          if (isStateVariableName(stateName)) {
            context.report({
              node,
              messageId: 'noDirectStateValueAssignment',
              data: {
                stateName,
                variableName: node.left.name,
              },
            });
          }
        }
      },
    };
  },
};
