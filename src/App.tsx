import { useState, useEffect } from 'react';
import './App.css'; // Importamos nuestra hoja de estilos

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('pwa-tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem('pwa-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="app-container">
      <div className="task-card">
        <h1 className="title">Gestor de Tareas PWA</h1>

        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Añadir nueva tarea..."
            className="task-input"
          />
          <button type="submit" className="btn-add">
            Agregar
          </button>
        </form>

        <ul className="task-list">
          {tasks.length === 0 ? (
            <li className="empty-state">
              No hay tareas pendientes. ¡Todo al día!
            </li>
          ) : (
            tasks.map((task) => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? 'task-completed' : ''}`}
              >
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <span className="task-text">
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="btn-delete"
                  aria-label="Eliminar tarea"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}