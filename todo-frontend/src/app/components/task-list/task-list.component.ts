import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() taskToggled = new EventEmitter<void>();
  @Output() taskEdited = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<void>();

  filter: 'all' | 'pending' | 'completed' = 'all';
  isLoading = false;

  constructor(private taskService: TaskService) { }

  get filteredTasks(): Task[] {
    switch (this.filter) {
      case 'pending':
        return this.tasks.filter(task => !task.completed);
      case 'completed':
        return this.tasks.filter(task => task.completed);
      default:
        return this.tasks;
    }
  }

  get pendingCount(): number {
    return this.tasks.filter(task => !task.completed).length;
  }

  get completedCount(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  onTaskToggled(taskId: number) {
    this.isLoading = true;
    this.taskService.toggleTaskCompletion(taskId).subscribe({
      next: () => {
        this.isLoading = false;
        this.taskToggled.emit();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error toggling task:', error);
      }
    });
  }

  onTaskEdited(task: Task) {
    this.taskEdited.emit(task);
  }

  onTaskDeleted(taskId: number) {
    this.isLoading = true;
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.isLoading = false;
        this.taskDeleted.emit();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting task:', error);
      }
    });
  }

  setFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter = filter;
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}
