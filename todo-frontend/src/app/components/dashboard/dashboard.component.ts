import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { HeaderComponent } from '../shared/header/header.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TaskFormComponent, TaskListComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks$: Observable<Task[]>;
  editingTask: Task | null = null;
  isLoading = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {
    this.tasks$ = this.taskService.getTasks();
  }

  ngOnInit() {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading tasks:', error);
      }
    });
  }

  onTaskSubmitted(): void {
    this.editingTask = null;
    this.loadTasks(); // Recarregar a lista após submit
  }

  onTaskToggled(): void {
    this.loadTasks(); // Recarregar a lista após toggle
  }

  onTaskEdited(task: Task): void {
    this.editingTask = task;
  }

  onTaskDeleted(): void {
    this.loadTasks(); // Recarregar a lista após delete
  }

  onEditCancelled(): void {
    this.editingTask = null;
  }
}
