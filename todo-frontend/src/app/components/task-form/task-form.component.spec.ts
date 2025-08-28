import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskFormComponent } from './task-form.component';
import { Task } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, CommonModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.title).toBe('');
    expect(component.description).toBe('');
    expect(component.isEditing).toBe(false);
  });

  describe('editingTask input', () => {
    it('should populate form when editingTask is set', () => {
      const mockTask: Task = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      component.editingTask = mockTask;

      expect(component.title).toBe('Test Task');
      expect(component.description).toBe('Test Description');
      expect(component.isEditing).toBe(true);
    });

    it('should clear form when editingTask is null', () => {
      component.title = 'Previous Title';
      component.description = 'Previous Description';

      component.editingTask = null;

      expect(component.title).toBe('');
      expect(component.description).toBe('');
      expect(component.isEditing).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should not submit when title is empty', () => {
      spyOn(component.taskSubmitted, 'emit');
      component.title = '';
      
      component.onSubmit();
      
      expect(component.taskSubmitted.emit).not.toHaveBeenCalled();
    });

    it('should emit taskSubmitted when form is valid', () => {
      spyOn(component.taskSubmitted, 'emit');
      component.title = 'New Task';
      component.description = 'Task Description';
      
      component.onSubmit();
      
      expect(component.taskSubmitted.emit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task Description'
      });
    });

    it('should reset form after submission when not editing', () => {
      component.title = 'New Task';
      component.description = 'Task Description';
      
      component.onSubmit();
      
      expect(component.title).toBe('');
      expect(component.description).toBe('');
    });
  });

  describe('onCancel', () => {
    it('should emit editCancelled when editing', () => {
      spyOn(component.editCancelled, 'emit');
      component.editingTask = { id: 1, title: 'Test', completed: false, createdAt: new Date(), updatedAt: new Date() };
      
      component.onCancel();
      
      expect(component.editCancelled.emit).toHaveBeenCalled();
    });

    it('should reset form', () => {
      component.title = 'Some Title';
      component.description = 'Some Description';
      
      component.onCancel();
      
      expect(component.title).toBe('');
      expect(component.description).toBe('');
    });
  });

  describe('Template interactions', () => {
    it('should display correct button text when creating', () => {
      component.editingTask = null;
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.textContent).toContain('Adicionar Tarefa');
    });

    it('should display correct button text when editing', () => {
      component.editingTask = { id: 1, title: 'Test', completed: false, createdAt: new Date(), updatedAt: new Date() };
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.textContent).toContain('Salvar Alterações');
    });

    it('should show cancel button only when editing', () => {
      component.editingTask = null;
      fixture.detectChanges();
      
      let cancelButton = fixture.nativeElement.querySelector('.btn-cancel');
      expect(cancelButton).toBeFalsy();

      component.editingTask = { id: 1, title: 'Test', completed: false, createdAt: new Date(), updatedAt: new Date() };
      fixture.detectChanges();
      
      cancelButton = fixture.nativeElement.querySelector('.btn-cancel');
      expect(cancelButton).toBeTruthy();
    });

    it('should disable submit button when title is empty', () => {
      component.title = '';
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should enable submit button when title has content', () => {
      component.title = 'Valid Title';
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(false);
    });
  });
});
