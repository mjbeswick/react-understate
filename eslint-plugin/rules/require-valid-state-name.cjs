/**
 * @fileoverview ESLint rule to ensure state names are valid JavaScript identifiers
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require valid JavaScript identifiers for state names',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      invalidStateName:
        'Invalid state name "{{stateName}}": Names must be valid JavaScript identifiers (start with letter, underscore, or $, followed by letters, numbers, underscores, or $).',
    },
  },

  create(context) {
    // Function to check if a string is a valid JavaScript identifier
    function isValidIdentifier(name) {
      if (typeof name !== 'string' || name.length === 0) {
        return false;
      }
      
      // First character must be letter, underscore, or dollar sign
      const firstChar = name[0];
      if (!/[a-zA-Z_$]/.test(firstChar)) {
        return false;
      }
      
      // Remaining characters must be letters, numbers, underscores, or dollar signs
      for (let i = 1; i < name.length; i++) {
        const char = name[i];
        if (!/[a-zA-Z0-9_$]/.test(char)) {
          return false;
        }
      }
      
      return true;
    }

    // Function to check if a node is a state creation call
    function isStateCreationCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        (node.callee.name === 'state' ||
          node.callee.name === 'derived' ||
          node.callee.name === 'asyncDerived' ||
          node.callee.name === 'effect' ||
          node.callee.name === 'action')
      );
    }

    // Function to extract state name from call arguments
    function getStateNameFromCall(node) {
      if (node.arguments.length >= 2 && node.arguments[1].type === 'Literal') {
        return node.arguments[1].value;
      }
      return null;
    }

    return {
      CallExpression(node) {
        if (isStateCreationCall(node)) {
          const stateName = getStateNameFromCall(node);
          
          if (stateName && !isValidIdentifier(stateName)) {
            context.report({
              node: node.arguments[1],
              messageId: 'invalidStateName',
              data: {
                stateName,
              },
            });
          }
        }
      },
    };
  },
};
