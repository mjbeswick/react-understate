/**
 * @fileoverview ESLint rule to prevent state updates in effects
 * @author mjbeswick
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent state updates inside effects. State updates should be done in actions instead.',
      category: 'React Understate',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noStateUpdatesInEffect:
        'Avoid updating state inside effects. State updates should be done in actions instead.',
    },
  },

  create(context) {
    const stateVariables = new Set();

    function isEffectCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'effect'
      );
    }

    function isStateCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'state'
      );
    }

    function isStateUpdate(node) {
      // Check for state(value) calls - look for calls to known state variables
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        stateVariables.has(node.callee.name)
      ) {
        return true;
      }

      // Check for state.value = ... assignments
      if (
        node.type === 'AssignmentExpression' &&
        node.left.type === 'MemberExpression' &&
        node.left.property.type === 'Identifier' &&
        node.left.property.name === 'value' &&
        node.left.object.type === 'Identifier' &&
        stateVariables.has(node.left.object.name)
      ) {
        return true;
      }

      return false;
    }

    function isInsideEffectFunction(node) {
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === 'ArrowFunctionExpression' ||
          parent.type === 'FunctionExpression'
        ) {
          // Check if this function is the first argument of an effect call
          let grandParent = parent.parent;
          if (
            grandParent &&
            grandParent.type === 'CallExpression' &&
            grandParent.callee &&
            grandParent.callee.type === 'Identifier' &&
            grandParent.callee.name === 'effect'
          ) {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      // Track state variable declarations
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          isStateCall(node.init) &&
          node.id &&
          node.id.type === 'Identifier'
        ) {
          stateVariables.add(node.id.name);
        }
      },

      // Check for state updates inside effects
      CallExpression(node) {
        if (isStateUpdate(node) && isInsideEffectFunction(node)) {
          context.report({
            node,
            messageId: 'noStateUpdatesInEffect',
          });
        }
      },

      AssignmentExpression(node) {
        if (isStateUpdate(node) && isInsideEffectFunction(node)) {
          context.report({
            node,
            messageId: 'noStateUpdatesInEffect',
          });
        }
      },
    };
  },
};
