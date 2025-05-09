import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Todo } from '../types';
import { todoService } from '../services/api';

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string;
  fetchTodos: () => Promise<void>;
  createTodo: (todo: Omit<Todo, 'id'>) => Promise<void>;
  updateTodo: (id: number, todo: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getTodos();
      setTodos(data);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch todos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todo: Omit<Todo, 'id'>) => {
    try {
      const newTodo = await todoService.createTodo(todo);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create todo';
      setError(errorMessage);
      throw err;
    }
  };

  const updateTodo = async (id: number, todo: Partial<Todo>) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, todo);
      setTodos(prevTodos => prevTodos.map(t => t.id === id ? updatedTodo : t));
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete todo';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <TodoContext.Provider value={{ todos, loading, error, fetchTodos, createTodo, updateTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
} 