import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css'
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() taskToggled = new EventEmitter<number>();
  @Output() taskEdited = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<number>();

  onToggleComplete() {
    this.taskToggled.emit(this.task.id);
  }

  onEdit() {
    this.taskEdited.emit(this.task);
  }

  onDelete() {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskDeleted.emit(this.task.id);
    }
  }
}
