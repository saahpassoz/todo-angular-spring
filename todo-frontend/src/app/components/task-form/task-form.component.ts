import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent {
  @Input() editingTask: Task | null = null;
  @Output() taskSubmitted = new EventEmitter<void>();
  @Output() editCancelled = new EventEmitter<void>();

  title: string = '';
  description: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    if (this.editingTask) {
      this.title = this.editingTask.title;
      this.description = this.editingTask.description || '';
    }
  }

  onSubmit() {
    if (!this.title.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.editingTask) {
      // Editando tarefa existente
      this.taskService.updateTask(this.editingTask.id, {
        title: this.title.trim(),
        description: this.description.trim() || undefined
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.taskSubmitted.emit();
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Erro ao atualizar tarefa';
        }
      });
    } else {
      // Criando nova tarefa
      this.taskService.addTask(this.title.trim(), this.description.trim() || undefined).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.taskSubmitted.emit();
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Erro ao criar tarefa';
        }
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.editCancelled.emit();
  }

  private resetForm() {
    this.title = '';
    this.description = '';
    this.errorMessage = '';
  }

  get isEditing(): boolean {
    return !!this.editingTask;
  }
}
