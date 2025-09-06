/**
 * @fileoverview ESLint rule to prevent direct state mutation
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description:
        'Prevent direct mutation of state objects and arrays',
      category: 'React Understate',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noDirectStateMutation:
        'Avoid directly mutating state objects/arrays. Use immutable updates instead.',
    },
  },

  create(context) {
    function isStateAccess(node) {
      // Check if this is accessing state.value
      return (
        node.type === 'MemberExpression' &&
        node.property.type === 'Identifier' &&
        node.property.name === 'value' &&
        node.object.type === 'Identifier'
      );
    }

    function isDirectMutation(node) {
      // Check for array mutation methods
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'MemberExpression' &&
        isStateAccess(node.callee.object) &&
        node.callee.property.type === 'Identifier' &&
        ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(node.callee.property.name)
      ) {
        return true;
      }

      // Check for object property assignment
      if (
        node.type === 'AssignmentExpression' &&
        node.left.type === 'MemberExpression' &&
        node.left.object.type === 'MemberExpression' &&
        isStateAccess(node.left.object) &&
        node.left.property.type === 'Identifier'
      ) {
        return true;
      }

      // Check for delete operator
      if (
        node.type === 'UnaryExpression' &&
        node.operator === 'delete' &&
        node.argument.type === 'MemberExpression' &&
        node.argument.object.type === 'MemberExpression' &&
        isStateAccess(node.argument.object)
      ) {
        return true;
      }

      return false;
    }

    function getStateName(node) {
      if (node.callee && node.callee.object && node.callee.object.object) {
        return node.callee.object.object.name;
      }
      if (node.left && node.left.object && node.left.object.object) {
        return node.left.object.object.name;
      }
      if (node.argument && node.argument.object && node.argument.object.object) {
        return node.argument.object.object.name;
      }
      return 'state';
    }

    function getFixSuggestion(node) {
      const stateName = getStateName(node);
      
      if (node.type === 'CallExpression') {
        const method = node.callee.property.name;
        const args = node.arguments.map(arg => context.getSourceCode().getText(arg)).join(', ');
        
        switch (method) {
          case 'push':
            return `${stateName}.value = [...${stateName}.value, ${args}];`;
          case 'pop':
            return `${stateName}.value = ${stateName}.value.slice(0, -1);`;
          case 'shift':
            return `${stateName}.value = ${stateName}.value.slice(1);`;
          case 'unshift':
            return `${stateName}.value = [${args}, ...${stateName}.value];`;
          case 'splice':
            return `${stateName}.value = [...${stateName}.value.slice(0, ${args.split(',')[0]}), ...${args.split(',').slice(1)}, ...${stateName}.value.slice(${args.split(',')[0]} + ${args.split(',').slice(1).length})];`;
          case 'sort':
            return `${stateName}.value = [...${stateName}.value].sort(${args || ''});`;
          case 'reverse':
            return `${stateName}.value = [...${stateName}.value].reverse();`;
          default:
            return null;
        }
      }
      
      if (node.type === 'AssignmentExpression') {
        const property = node.left.property.name;
        const value = context.getSourceCode().getText(node.right);
        return `${stateName}.value = { ...${stateName}.value, ${property}: ${value} };`;
      }
      
      if (node.type === 'UnaryExpression' && node.operator === 'delete') {
        const property = node.argument.property.name;
        return `${stateName}.value = { ...${stateName}.value }; delete ${stateName}.value.${property};`;
      }
      
      return null;
    }

    return {
      CallExpression(node) {
        if (isDirectMutation(node)) {
          const fix = getFixSuggestion(node);
          context.report({
            node,
            messageId: 'noDirectStateMutation',
            fix: fix ? (fixer) => fixer.replaceText(node, fix) : null,
          });
        }
      },

      AssignmentExpression(node) {
        if (isDirectMutation(node)) {
          const fix = getFixSuggestion(node);
          context.report({
            node,
            messageId: 'noDirectStateMutation',
            fix: fix ? (fixer) => fixer.replaceText(node, fix) : null,
          });
        }
      },

      UnaryExpression(node) {
        if (isDirectMutation(node)) {
          const fix = getFixSuggestion(node);
          context.report({
            node,
            messageId: 'noDirectStateMutation',
            fix: fix ? (fixer) => fixer.replaceText(node, fix) : null,
          });
        }
      },
    };
  },
};
