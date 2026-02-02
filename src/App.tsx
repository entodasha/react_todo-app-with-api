/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserWarning } from './UserWarning';
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { SortType } from './types/sortField';
import { ErrorField } from './types/errorField';
import { AddBar } from './components/AddBar/AddBar';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { ErrorNotification } from './components/ErrorMessage/ErrorNotification';

export const App: React.FC = () => {
  //#region states

  const todoField = useRef<HTMLInputElement>(null);
  const editField = useRef<HTMLInputElement>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isChanging, setIsChanging] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [sortField, setSortField] = useState<SortType>(SortType.default);

  const completedCount = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  const completedTodosId = todos
    .filter(todo => todo.completed)
    .map(comleteTodo => comleteTodo.id);

  const inputFocus = () => {
    todoField.current?.focus();
  };

  const isHeaderButtonActive = todos.every(todo => todo.completed);
  const isFooterButtonDisabled = !todos.some(todo => todo.completed === true);
  const isToggleButtonVisible = todos.length !== 0;

  //#endregion

  //#region effects
  useEffect(() => {
    inputFocus();

    getTodos()
      .then(result => {
        setTodos(result);
      })
      .catch(() => {
        setErrorMessage(ErrorField.loadError);
      });
  }, []);

  useEffect(() => {
    if (!selectedTodo) {
      setValue('');

      return;
    } else {
      setValue(selectedTodo.title);
      editField.current?.focus();
    }
  }, [selectedTodo]);
  //#endregion

  //#region error

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    setIsErrorVisible(true);

    const timer = setTimeout(() => {
      setIsErrorVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleErrorClose = () => {
    setIsErrorVisible(false);
    setErrorMessage('');
  };
  //#endregion

  //#region handels

  //#region inputChanges
  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  //#endregion

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (query.trim() === '') {
      setErrorMessage(ErrorField.emptyTitle);

      return Promise.resolve();
    }

    const newTodo: Omit<Todo, 'id'> = {
      userId: USER_ID,
      title: query.trim(),
      completed: false,
    };

    if (todoField.current) {
      todoField.current.disabled = true;
    }

    setTempTodo({ ...newTodo, id: 0 });

    return createTodo({ ...newTodo })
      .then(addedTodo => {
        setTodos(prevTodos => [...prevTodos, addedTodo]);
        setQuery('');
      })
      .catch(() => {
        setErrorMessage(ErrorField.addError);
      })
      .finally(() => {
        setTempTodo(null);
        todoField.current!.disabled = false;
        inputFocus();
      });
  };

  const handleFilter = (field: SortType) => {
    setSortField(field);
  };

  //#region toggle
  const handleToggle = (currentTodo: Todo) => {
    setIsChanging(currSet => {
      const newSet = new Set(currSet);

      newSet.add(currentTodo.id);

      return newSet;
    });

    const updatedTodo = {
      ...currentTodo,
      completed: !currentTodo.completed,
    };

    return updateTodo(updatedTodo)
      .then(todo => {
        setTodos(currTodos => {
          const newTodos = [...currTodos];
          const index = newTodos.findIndex(t => t.id === currentTodo.id);

          newTodos.splice(index, 1, todo);

          return newTodos;
        });
      })
      .catch(() => {
        setErrorMessage(ErrorField.updateError);
      })
      .finally(() => {
        setIsChanging(currSet => {
          const newSet = new Set(currSet);

          newSet.delete(currentTodo.id);

          return newSet;
        });
        inputFocus();
      });
  };

  const handleToggleAll = () => {
    setIsChanging(currSet => {
      const newSet = new Set(currSet);

      todos.forEach(todo => newSet.add(todo.id));

      return newSet;
    });

    const shouldComplete = todos.some(todo => !todo.completed);

    const todosToUpdate = todos.filter(
      todo => todo.completed !== shouldComplete,
    );

    const completedPromises = todosToUpdate.map(todo => handleToggle(todo));

    Promise.allSettled(completedPromises).then(results => {
      inputFocus();
      const failedIds = completedPromises.filter((id, i) => {
        return results[i].status === 'rejected';
      });
      const successIds = completedPromises.filter((id, i) => {
        return results[i].status === 'fulfilled';
      });

      if (successIds.length > 0) {
        setTodos(currTodos =>
          currTodos.map(todo =>
            successIds.includes(todo.id)
              ? { ...todo, completed: !todo.completed }
              : todo,
          ),
        );
      }

      if (failedIds.length > 0) {
        setErrorMessage(ErrorField.updateError);
      }

      setIsChanging(currSet => {
        const newSet = new Set(currSet);

        todos.forEach(todo => newSet.delete(todo.id));

        return newSet;
      });
    });
  };
  //#endregion

  //#region delete
  const handleDelete = (todoId: number) => {
    setIsChanging(currSet => {
      const newSet = new Set(currSet);

      newSet.add(todoId);

      return newSet;
    });

    return deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage(ErrorField.deleteError);
      })
      .finally(() => {
        setIsChanging(currSet => {
          const newSet = new Set(currSet);

          newSet.delete(todoId);

          return newSet;
        });
        inputFocus();
      });
  };

  const handleDeleteCompetedTodos = () => {
    setIsChanging(currSet => {
      const newSet = new Set(currSet);

      completedTodosId.forEach(id => newSet.add(id));

      return newSet;
    });

    const deletePromises = completedTodosId.map(id => deleteTodo(id));

    Promise.allSettled(deletePromises).then(results => {
      inputFocus();
      const successId = completedTodosId.filter((id, i) => {
        return results[i].status === 'fulfilled';
      });
      const failedId = completedTodosId.filter((id, i) => {
        return results[i].status === 'rejected';
      });

      if (successId.length > 0) {
        setTodos(curr =>
          curr.filter(oldTodo => !successId.includes(oldTodo.id)),
        );
      }

      if (failedId.length > 0) {
        setErrorMessage(ErrorField.deleteError);
      }

      setIsChanging(currSet => {
        const newSet = new Set(currSet);

        completedTodosId.forEach(id => newSet.delete(id));

        return newSet;
      });
    });
  };
  //#endregion

  const handleOpenEditForm = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const handleEditSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> | void => {
    event.preventDefault();

    if (selectedTodo) {
      if (value.trim() === '') {
        return handleDelete(selectedTodo.id);
      }

      if (value.trim() === selectedTodo.title) {
        setSelectedTodo(null);

        return;
      }

      setIsChanging(currSet => {
        const newSet = new Set(currSet);

        newSet.add(selectedTodo.id);

        return newSet;
      });

      const updatedTodo = {
        ...selectedTodo,
        title: value.trim(),
      };

      return updateTodo(updatedTodo)
        .then(todo => {
          console.log('updated todo', todo);

          setTodos(prevTodos => {
            return prevTodos.map(prevTodo =>
              prevTodo.id === todo.id ? todo : prevTodo,
            );
          });

          setSelectedTodo(null);
        })
        .catch(() => {
          setErrorMessage(ErrorField.updateError);
          editField.current?.focus();
          setValue(selectedTodo.title);
        })
        .finally(() => {
          setIsChanging(currSet => {
            const newSet = new Set(currSet);

            newSet.delete(selectedTodo.id);

            return newSet;
          });
        });
    }
  };

  const handleCanselEdit = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
      setSelectedTodo(null);
    }
  };
  // #endregion

  const visibleTodos = useMemo(() => {
    const copyTodos = [...todos];

    switch (sortField) {
      case SortType.active:
        return copyTodos.filter(todo => !todo.completed);
      case SortType.completed:
        return copyTodos.filter(todo => todo.completed);
      case SortType.default:
      default:
        return copyTodos;
    }
  }, [todos, sortField]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <AddBar
          todoField={todoField}
          query={query}
          isActive={isHeaderButtonActive}
          isVisible={isToggleButtonVisible}
          onToggleAll={handleToggleAll}
          onSubmit={handleSubmit}
          onQueryChange={handleQueryChange}
        />

        <TodoList
          todos={visibleTodos}
          tempTodo={tempTodo}
          value={value}
          editField={editField}
          selectedTodo={selectedTodo}
          isChanging={isChanging}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onValueChange={handleValueChange}
          onDoubleClick={handleOpenEditForm}
          onSubmit={handleEditSubmit}
          onKeyDown={handleCanselEdit}
        />

        {todos.length > 0 && (
          <Footer
            count={completedCount}
            isDisabled={isFooterButtonDisabled}
            onDelete={handleDeleteCompetedTodos}
            sortField={sortField}
            onFilter={handleFilter}
          />
        )}
      </div>

      <ErrorNotification
        message={errorMessage}
        isVisible={isErrorVisible}
        onClose={handleErrorClose}
      />
    </div>
  );
};
