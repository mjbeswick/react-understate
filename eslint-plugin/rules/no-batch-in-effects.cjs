/**
 * @fileoverview Prevents batch() calls inside effects since effects automatically batch updates
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent batch() calls inside effects since effects automatically batch state updates',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noBatchInEffects: 'Do not use batch() inside effects. Effects automatically batch state updates, making batch() calls redundant.',
    },
  },

  create(context) {
    return {
      // Check for batch() calls inside effects
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'batch'
        ) {
          // Check if this batch call is inside an effect
          let parent = node.parent;
          let isInsideEffect = false;
          
          while (parent) {
            // Check if we're inside a function that's passed to effect()
            if (
              parent.type === 'CallExpression' &&
              parent.callee.type === 'Identifier' &&
              parent.callee.name === 'effect'
            ) {
              isInsideEffect = true;
              break;
            }
            parent = parent.parent;
          }

          if (isInsideEffect) {
            context.report({
              node,
              messageId: 'noBatchInEffects',
            });
          }
        }
      },
    };
  },
};
