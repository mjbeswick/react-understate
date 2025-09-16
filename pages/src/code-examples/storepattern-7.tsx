// todoStore.test.ts
import { todoStore } from './todoStore';

describe('Todo Store', () => {
  beforeEach(() => {
    // Reset state before each test
    todoStore.todos.value = [];
    todoStore.filter.value = 'all';
    todoStore.newTodo.value = '';
  });

  test('adds a todo', () => {
    todoStore.setNewTodo('Learn React Understate');
    todoStore.addTodo();
    
    expect(todoStore.todos.value).toHaveLength(1);
    expect(todoStore.todos.value[0].text).toBe('Learn React Understate');
    expect(todoStore.newTodo.value).toBe('');
  });

  test('filters todos correctly', () => {
    // Add some todos
    todoStore.setNewTodo('Active todo');
    todoStore.addTodo();
    
    todoStore.setNewTodo('Completed todo');
    todoStore.addTodo();
    todoStore.toggleTodo(todoStore.todos.value[1].id);
    
    // Test filtering
    todoStore.setFilter('active');
    expect(todoStore.filteredTodos.value).toHaveLength(1);
    expect(todoStore.filteredTodos.value[0].completed).toBe(false);
    
    todoStore.setFilter('completed');
    expect(todoStore.filteredTodos.value).toHaveLength(1);
    expect(todoStore.filteredTodos.value[0].completed).toBe(true);
  });

  test('computes statistics correctly', () => {
    // Add mixed todos
    todoStore.setNewTodo('Todo 1');
    todoStore.addTodo();
    todoStore.setNewTodo('Todo 2');
    todoStore.addTodo();
    
    // Complete one
    todoStore.toggleTodo(todoStore.todos.value[0].id);
    
    expect(todoStore.totalCount.value).toBe(2);
    expect(todoStore.activeCount.value).toBe(1);
    expect(todoStore.completedCount.value).toBe(1);
    expect(todoStore.hasCompletedTodos.value).toBe(true);
  });
});