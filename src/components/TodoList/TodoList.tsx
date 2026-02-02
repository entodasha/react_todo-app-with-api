import { Todo } from '../../types/Todo';

type Props = {
  todos: Todo[];
  value: string;
  editField?: React.LegacyRef<HTMLInputElement>;
  selectedTodo: Todo | null;
  isChanging: Set<number>;
  tempTodo: Todo | null;
  onDelete: (todoId: number) => void;
  onToggle: (todo: Todo) => Promise<void>;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDoubleClick: (todo: Todo) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  onKeyDown: (event: React.KeyboardEvent<HTMLFormElement>) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  editField,
  selectedTodo,
  value,
  isChanging,
  onDelete,
  onToggle,
  onDoubleClick,
  onValueChange,
  onSubmit,
  onKeyDown,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <div
          data-cy="Todo"
          className={`todo ${todo.completed ? 'completed' : ''}`}
          key={todo.id}
        >
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={todo.completed}
              onChange={() => onToggle(todo)}
            />
          </label>

          {selectedTodo?.id === todo.id ? (
            <form onSubmit={onSubmit} onBlur={onSubmit} onKeyDown={onKeyDown}>
              <input
                ref={editField}
                data-cy="TodoTitleField"
                type="text"
                className="todo__title-field"
                placeholder="Empty todo will be deleted"
                value={value}
                onChange={onValueChange}
              />
            </form>
          ) : (
            <>
              <span
                data-cy="TodoTitle"
                className="todo__title"
                onDoubleClick={() => onDoubleClick(todo)}
              >
                {todo.title}
              </span>

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => onDelete(todo.id)}
              >
                ×
              </button>
            </>
          )}

          <div
            data-cy="TodoLoader"
            className={`modal overlay ${isChanging.has(todo.id) ? 'is-active' : ''}`}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      ))}
      {tempTodo !== null && (
        <div data-cy="Todo" className="todo">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
            />
          </label>

          <span data-cy="TodoTitle" className="todo__title">
            {tempTodo.title}
          </span>

          <button type="button" className="todo__remove" data-cy="TodoDelete">
            ×
          </button>

          <div data-cy="TodoLoader" className="modal overlay is-active">
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      )}
    </section>
  );
};
