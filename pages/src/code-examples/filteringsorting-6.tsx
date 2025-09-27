import React from 'react';
import { useUnderstate } from 'react-understate';
import {
  filteredTodos,
  sortedTodos,
  paginatedTodos,
  paginationInfo,
  setFilterText,
  setFilterCompleted,
  setSortField,
  setPage,
  nextPage,
  prevPage,
} from './todoStore';

function TodoList() {
  const todos = useUnderstate(paginatedTodos);
  const pagination = useUnderstate(paginationInfo);
  const filterText = useUnderstate(filterText);
  const filterCompleted = useUnderstate(filterCompleted);
  const sortField = useUnderstate(sortField);

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search todos..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />

        <select
          value={filterCompleted}
          onChange={e => setFilterCompleted(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Sort controls */}
      <div className="sort-controls">
        <button onClick={() => setSortField('text')}>
          Sort by Text {sortField === 'text' ? '↑' : ''}
        </button>
        <button onClick={() => setSortField('createdAt')}>
          Sort by Date {sortField === 'createdAt' ? '↑' : ''}
        </button>
        <button onClick={() => setSortField('priority')}>
          Sort by Priority {sortField === 'priority' ? '↑' : ''}
        </button>
      </div>

      {/* Todo list */}
      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className="todo-item">
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            <span className="priority">{todo.priority}</span>
            <span className="category">{todo.category}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={prevPage} disabled={!pagination.hasPrevPage}>
          Previous
        </button>

        <span>
          Page {pagination.currentPage} of {pagination.totalPages}(
          {pagination.startIndex}-{pagination.endIndex} of{' '}
          {pagination.totalItems})
        </span>

        <button onClick={nextPage} disabled={!pagination.hasNextPage}>
          Next
        </button>
      </div>
    </div>
  );
}

// Advanced filtering component
function AdvancedFilters() {
  const selectedTags = useUnderstate(selectedTags);
  const availableTags = useUnderstate(availableTags);
  const dateRange = useUnderstate(dateRange);
  const priorityRange = useUnderstate(priorityRange);

  return (
    <div className="advanced-filters">
      {/* Tag filters */}
      <div className="tag-filters">
        <h3>Tags</h3>
        {availableTags.map(tag => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggleTag(tag)}
            />
            {tag}
          </label>
        ))}
      </div>

      {/* Date range */}
      <div className="date-range">
        <h3>Date Range</h3>
        <input
          type="date"
          value={dateRange.start?.toISOString().split('T')[0] || ''}
          onChange={e =>
            setDateRange(
              e.target.value ? new Date(e.target.value) : null,
              dateRange.end,
            )
          }
        />
        <input
          type="date"
          value={dateRange.end?.toISOString().split('T')[0] || ''}
          onChange={e =>
            setDateRange(
              dateRange.start,
              e.target.value ? new Date(e.target.value) : null,
            )
          }
        />
      </div>

      {/* Priority range */}
      <div className="priority-range">
        <h3>Priority Range</h3>
        <input
          type="range"
          min="1"
          max="3"
          value={priorityRange.min}
          onChange={e =>
            setPriorityRange(parseInt(e.target.value), priorityRange.max)
          }
        />
        <input
          type="range"
          min="1"
          max="3"
          value={priorityRange.max}
          onChange={e =>
            setPriorityRange(priorityRange.min, parseInt(e.target.value))
          }
        />
      </div>
    </div>
  );
}

export { TodoList, AdvancedFilters };
