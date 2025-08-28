import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with example tasks', (done) => {
    service.getTasks().subscribe(tasks => {
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].title).toBe('Bem-vindo ao Todo App!');
      done();
    });
  });

  describe('addTask', () => {
    it('should add a new task', (done) => {
      let initialLength = 0;
      
      service.getTasks().subscribe(tasks => {
        initialLength = tasks.length;
        
        service.addTask('Nova Tarefa', 'Descrição da nova tarefa');
        
        service.getTasks().subscribe(updatedTasks => {
          expect(updatedTasks.length).toBe(initialLength + 1);
          const newTask = updatedTasks[updatedTasks.length - 1];
          expect(newTask.title).toBe('Nova Tarefa');
          expect(newTask.description).toBe('Descrição da nova tarefa');
          expect(newTask.completed).toBe(false);
          expect(newTask.id).toBeTruthy();
          done();
        });
      });
    });

    it('should add task without description', (done) => {
      service.addTask('Tarefa sem descrição');
      
      service.getTasks().subscribe(tasks => {
        const newTask = tasks[tasks.length - 1];
        expect(newTask.title).toBe('Tarefa sem descrição');
        expect(newTask.description).toBeUndefined();
        done();
      });
    });
  });

  describe('updateTask', () => {
    it('should update existing task', (done) => {
      service.getTasks().subscribe(tasks => {
        const taskToUpdate = tasks[0];
        
        service.updateTask(taskToUpdate.id, {
          title: 'Título Atualizado',
          description: 'Descrição Atualizada'
        });
        
        service.getTasks().subscribe(updatedTasks => {
          const updatedTask = updatedTasks.find(t => t.id === taskToUpdate.id);
          expect(updatedTask?.title).toBe('Título Atualizado');
          expect(updatedTask?.description).toBe('Descrição Atualizada');
          expect(updatedTask?.updatedAt).toBeTruthy();
          done();
        });
      });
    });

    it('should not update non-existing task', (done) => {
      service.getTasks().subscribe(initialTasks => {
        service.updateTask(999, { title: 'Não existe' });
        
        service.getTasks().subscribe(finalTasks => {
          expect(finalTasks.length).toBe(initialTasks.length);
          done();
        });
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete existing task', (done) => {
      service.getTasks().subscribe(tasks => {
        const taskToDelete = tasks[0];
        const initialLength = tasks.length;
        
        service.deleteTask(taskToDelete.id);
        
        service.getTasks().subscribe(remainingTasks => {
          expect(remainingTasks.length).toBe(initialLength - 1);
          expect(remainingTasks.find(t => t.id === taskToDelete.id)).toBeUndefined();
          done();
        });
      });
    });

    it('should not delete non-existing task', (done) => {
      service.getTasks().subscribe(initialTasks => {
        const initialLength = initialTasks.length;
        
        service.deleteTask(999);
        
        service.getTasks().subscribe(tasks => {
          expect(tasks.length).toBe(initialLength);
          done();
        });
      });
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task completion status', (done) => {
      service.getTasks().subscribe(tasks => {
        const taskToToggle = tasks[0];
        const initialStatus = taskToToggle.completed;
        
        service.toggleTaskCompletion(taskToToggle.id);
        
        service.getTasks().subscribe(updatedTasks => {
          const toggledTask = updatedTasks.find(t => t.id === taskToToggle.id);
          expect(toggledTask?.completed).toBe(!initialStatus);
          expect(toggledTask?.updatedAt).toBeTruthy();
          done();
        });
      });
    });
  });

  describe('localStorage integration', () => {
    it('should persist tasks to localStorage when adding', () => {
      service.addTask('Tarefa Persistente');
      
      const storedTasks = localStorage.getItem('tasks');
      expect(storedTasks).toBeTruthy();
      
      const tasks = JSON.parse(storedTasks!);
      const persistentTask = tasks.find((t: Task) => t.title === 'Tarefa Persistente');
      expect(persistentTask).toBeTruthy();
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('tasks', 'invalid json');
      
      // Criar nova instância do serviço
      const newService = new TaskService();
      
      // Deve inicializar com tarefas de exemplo mesmo com dados inválidos
      newService.getTasks().subscribe(tasks => {
        expect(tasks.length).toBeGreaterThan(0);
      });
    });
  });
});
