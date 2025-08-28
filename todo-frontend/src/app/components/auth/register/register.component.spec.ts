import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/auth.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, FormsModule, RouterLink],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.name).toBe('');
    expect(component.credentials.email).toBe('');
    expect(component.credentials.password).toBe('');
    expect(component.confirmPassword).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  describe('onSubmit', () => {
    it('should show error for empty name', () => {
      component.credentials.name = '';
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Por favor, preencha todos os campos');
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should show error for mismatched passwords', () => {
      component.credentials.name = 'Test User';
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'different-password';

      component.onSubmit();

      expect(component.errorMessage).toBe('As senhas não coincidem');
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should submit valid form and navigate on success', () => {
      component.credentials.name = 'Test User';
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      const mockResponse = {
        user: { id: 1, email: 'test@test.com', name: 'Test User', createdAt: new Date() },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      };

      authService.register.and.returnValue(of(mockResponse));

      component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle registration error', () => {
      component.credentials.name = 'Test User';
      component.credentials.email = 'admin@todo.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      authService.register.and.returnValue(throwError(() => ({ message: 'Email já está em uso' })));

      component.onSubmit();

      expect(component.errorMessage).toBe('Email já está em uso');
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Template interactions', () => {
    it('should display error message when present', () => {
      component.errorMessage = 'Test error message';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement?.textContent).toContain('Test error message');
    });

    it('should disable submit button when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });
  });
});
