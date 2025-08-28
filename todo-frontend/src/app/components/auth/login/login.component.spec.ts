import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, RouterLink],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.email).toBe('');
    expect(component.credentials.password).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  describe('onSubmit', () => {
    it('should show error for empty email', () => {
      component.credentials.email = '';
      component.credentials.password = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Por favor, preencha todos os campos');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show error for empty password', () => {
      component.credentials.email = 'test@test.com';
      component.credentials.password = '';

      component.onSubmit();

      expect(component.errorMessage).toBe('Por favor, preencha todos os campos');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should submit valid form and navigate on success', () => {
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';

      const mockResponse = {
        user: { id: 1, email: 'test@test.com', name: 'Test User', createdAt: new Date() },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      };

      authService.login.and.returnValue(of(mockResponse));

      component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle login error', () => {
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'wrongpassword';

      authService.login.and.returnValue(throwError(() => ({ message: 'Credenciais inválidas' })));

      component.onSubmit();

      expect(component.errorMessage).toBe('Credenciais inválidas');
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle generic error', () => {
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';

      authService.login.and.returnValue(throwError(() => ({})));

      component.onSubmit();

      expect(component.errorMessage).toBe('Erro no login');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('fillDemoCredentials', () => {
    it('should fill admin credentials', () => {
      component.fillDemoCredentials('admin');

      expect(component.credentials.email).toBe('admin@todo.com');
      expect(component.credentials.password).toBe('admin123');
    });

    it('should fill user credentials', () => {
      component.fillDemoCredentials('user');

      expect(component.credentials.email).toBe('user@todo.com');
      expect(component.credentials.password).toBe('user123');
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

    it('should call onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit'));

      expect(component.onSubmit).toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should set loading state during login', () => {
      component.credentials.email = 'test@test.com';
      component.credentials.password = 'password123';

      const mockResponse = {
        user: { id: 1, email: 'test@test.com', name: 'Test User', createdAt: new Date() },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      };

      authService.login.and.returnValue(of(mockResponse));

      expect(component.isLoading).toBe(false);

      component.onSubmit();
      expect(component.isLoading).toBe(false);
    });
  });
});
