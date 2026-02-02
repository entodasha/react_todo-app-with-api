import { ChangeEvent, LegacyRef } from 'react';

type Props = {
  todoField?: LegacyRef<HTMLInputElement>;
  query: string;
  isActive: boolean;
  isVisible: boolean;
  onToggleAll: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onQueryChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const AddBar: React.FC<Props> = ({
  todoField,
  query,
  isActive,
  isVisible,
  onSubmit,
  onToggleAll,
  onQueryChange,
}) => {
  return (
    <header className="todoapp__header">
      {isVisible && (
        <button
          type="button"
          className={`todoapp__toggle-all ${isActive ? 'active' : ''}`}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <form onSubmit={onSubmit}>
        <input
          ref={todoField}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={query}
          onChange={onQueryChange}
        />
      </form>
    </header>
  );
};
