/**
 * @fileoverview ESLint rule to prevent direct state assignment which breaks reactivity
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent assigning state objects to variables, which breaks reactivity',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noDirectStateAssignment: 'Do not assign state objects to variables. This breaks reactivity. Pass the state object itself instead.',
      noDirectStateValueAssignment: 'Do not assign state values to variables. This breaks reactivity. Access the state.value directly when needed.',
    },
  },

  create(context) {
    function isStateVariable(node) {
      // Check if this variable is assigned a state object
      if (node.init && node.init.type === 'CallExpression') {
        const callee = node.init.callee;
        return (
          callee.type === 'Identifier' &&
          callee.name === 'state'
        );
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
      // Check if the variable name suggests it's a state
      // This is a heuristic - we'll check if it's been assigned a state() call
      const scope = context.getScope();
      const variable = scope.variables.find(v => v.name === name);
      
      if (variable && variable.defs.length > 0) {
        const def = variable.defs[0];
        if (def.node.type === 'VariableDeclarator' && def.node.init) {
          const init = def.node.init;
          return (
            init.type === 'CallExpression' &&
            init.callee.type === 'Identifier' &&
            init.callee.name === 'state'
          );
        }
      }
      return false;
    }

    return {
      // Check for state object assignments
      VariableDeclarator(node) {
        if (isStateVariable(node)) {
          context.report({
            node,
            messageId: 'noDirectStateAssignment',
            data: {
              variableName: node.id.name,
            },
          });
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

      // Check for variable declarations with state values
      VariableDeclarator(node) {
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
    };
  },
};
