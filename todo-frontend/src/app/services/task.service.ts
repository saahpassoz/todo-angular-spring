import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_BASE = 'http://localhost:8080/api';
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadTasks();
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getCurrentUser() ? localStorage.getItem('auth_token') : null;
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  private loadTasks(): void {
    if (this.authService.isAuthenticated()) {
      this.getTasks().subscribe();
    } else {
      this.loadExampleTasks();
    }
  }

  private loadExampleTasks(): void {
    const exampleTasks: Task[] = [
      {
        id: 1,
        title: 'Bem-vindo ao Todo App!',
        description: 'Esta é uma tarefa de exemplo. Você pode editá-la, marcá-la como concluída ou excluí-la.',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: 'Criar uma nova tarefa',
        description: 'Use o formulário acima para adicionar suas próprias tarefas.',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        title: 'Marcar tarefa como concluída',
        description: 'Clique no checkbox para marcar uma tarefa como concluída.',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.tasksSubject.next(exampleTasks);
  }

  getTasks(): Observable<Task[]> {
    if (!this.authService.isAuthenticated()) {
      return this.tasksSubject.asObservable();
    }

    return this.http.get<Task[]>(`${this.API_BASE}/tasks`, this.getAuthHeaders())
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
        }),
        catchError(error => {
          console.error('Error loading tasks:', error);
          return this.tasksSubject.asObservable();
        })
      );
  }

  addTask(title: string, description?: string): Observable<Task> {
    const newTask = {
      title: title.trim(),
      description: description?.trim() || undefined
    };

    if (!this.authService.isAuthenticated()) {
      // Modo local para usuários não autenticados
      const localTask: Task = {
        id: Date.now(),
        ...newTask,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const currentTasks = this.tasksSubject.value;
      this.tasksSubject.next([...currentTasks, localTask]);
      return of(localTask);
    }

    return this.http.post<Task>(`${this.API_BASE}/tasks`, newTask, this.getAuthHeaders())
      .pipe(
        tap(task => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([...currentTasks, task]);
        }),
        catchError(error => {
          console.error('Error creating task:', error);
          throw error;
        })
      );
  }

  updateTask(id: number, updates: Partial<Task>): Observable<Task> {
    if (!this.authService.isAuthenticated()) {
      // Modo local
      const currentTasks = this.tasksSubject.value;
      const taskIndex = currentTasks.findIndex(t => t.id === id);
      
      if (taskIndex !== -1) {
        const updatedTask = {
          ...currentTasks[taskIndex],
          ...updates,
          updatedAt: new Date()
        };
        const newTasks = [...currentTasks];
        newTasks[taskIndex] = updatedTask;
        this.tasksSubject.next(newTasks);
        return of(updatedTask);
      }
      
      throw new Error('Task not found');
    }

    return this.http.put<Task>(`${this.API_BASE}/tasks/${id}`, updates, this.getAuthHeaders())
      .pipe(
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const taskIndex = currentTasks.findIndex(t => t.id === id);
          if (taskIndex !== -1) {
            const newTasks = [...currentTasks];
            newTasks[taskIndex] = updatedTask;
            this.tasksSubject.next(newTasks);
          }
        }),
        catchError(error => {
          console.error('Error updating task:', error);
          throw error;
        })
      );
  }

  deleteTask(id: number): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      // Modo local
      const currentTasks = this.tasksSubject.value;
      const filteredTasks = currentTasks.filter(t => t.id !== id);
      this.tasksSubject.next(filteredTasks);
      return of(void 0);
    }

    return this.http.delete<void>(`${this.API_BASE}/tasks/${id}`, this.getAuthHeaders())
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(t => t.id !== id);
          this.tasksSubject.next(filteredTasks);
        }),
        catchError(error => {
          console.error('Error deleting task:', error);
          throw error;
        })
      );
  }

  toggleTaskCompletion(id: number): Observable<Task> {
    const currentTasks = this.tasksSubject.value;
    const task = currentTasks.find(t => t.id === id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    const updates = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : undefined
    };

    return this.updateTask(id, updates);
  }

  getTaskById(id: number): Observable<Task | null> {
    if (!this.authService.isAuthenticated()) {
      const task = this.tasksSubject.value.find(t => t.id === id) || null;
      return of(task);
    }

    return this.http.get<Task>(`${this.API_BASE}/tasks/${id}`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('Error loading task:', error);
          return of(null);
        })
      );
  }

  // Métodos de filtro local (para compatibilidade)
  getCompletedTasks(): Task[] {
    return this.tasksSubject.value.filter(task => task.completed);
  }

  getPendingTasks(): Task[] {
    return this.tasksSubject.value.filter(task => !task.completed);
  }

  getTasksCount(): { total: number; completed: number; pending: number } {
    const tasks = this.tasksSubject.value;
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length
    };
  }

  // Método para sincronizar com o servidor
  syncTasks(): Observable<Task[]> {
    if (!this.authService.isAuthenticated()) {
      return this.tasksSubject.asObservable();
    }

    return this.getTasks();
  }


}


