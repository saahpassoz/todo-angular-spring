import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login with valid credentials', (done) => {
      const loginRequest: LoginRequest = {
        email: 'admin@todo.com',
        password: 'admin123'
      };

      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@todo.com'
        }
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response.token).toBe('mock-jwt-token');
          expect(response.refreshToken).toBe('mock-refresh-token');
          expect(response.user.email).toBe('admin@todo.com');
          expect(response.user.name).toBe('Admin User');
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });

    it('should fail login with invalid credentials', (done) => {
      const loginRequest: LoginRequest = {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      };

      service.login(loginRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Email ou senha inválidos' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should update current user after successful login', (done) => {
      const loginRequest: LoginRequest = {
        email: 'user@todo.com',
        password: 'user123'
      };

      service.login(loginRequest).subscribe({
        next: () => {
          service.currentUser$.subscribe(user => {
            expect(user).toBeTruthy();
            expect(user?.email).toBe('user@todo.com');
            expect(user?.name).toBe('Usuário Demo');
            done();
          });
        },
        error: done.fail
      });
    });
  });

  describe('register', () => {
    it('should register new user with valid data', (done) => {
      const registerRequest: RegisterRequest = {
        email: 'newuser@test.com',
        password: 'password123',
        name: 'New User'
      };

      service.register(registerRequest).subscribe({
        next: (response) => {
          expect(response.token).toBeTruthy();
          expect(response.refreshToken).toBeTruthy();
          expect(response.user.email).toBe('newuser@test.com');
          expect(response.user.name).toBe('New User');
          done();
        },
        error: done.fail
      });
    });

    it('should fail to register with existing email', (done) => {
      const registerRequest: RegisterRequest = {
        email: 'admin@todo.com',
        password: 'password123',
        name: 'Admin User'
      };

      service.register(registerRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.message).toBe('Email já está em uso');
          done();
        }
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when valid token exists', (done) => {
      const loginRequest: LoginRequest = {
        email: 'admin@todo.com',
        password: 'admin123'
      };

      service.login(loginRequest).subscribe({
        next: () => {
          expect(service.isAuthenticated()).toBe(true);
          done();
        },
        error: done.fail
      });
    });
  });

  describe('logout', () => {
    it('should clear user data and token', (done) => {
      const loginRequest: LoginRequest = {
        email: 'admin@todo.com',
        password: 'admin123'
      };

      service.login(loginRequest).subscribe({
        next: () => {
          expect(service.isAuthenticated()).toBe(true);
          
          service.logout();
          
          expect(service.isAuthenticated()).toBe(false);
          service.currentUser$.subscribe(user => {
            expect(user).toBe(null);
            done();
          });
        },
        error: done.fail
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      expect(service.getCurrentUser()).toBe(null);
    });

    it('should return current user when logged in', (done) => {
      const loginRequest: LoginRequest = {
        email: 'admin@todo.com',
        password: 'admin123'
      };

      service.login(loginRequest).subscribe({
        next: () => {
          const user = service.getCurrentUser();
          expect(user).toBeTruthy();
          expect(user?.email).toBe('admin@todo.com');
          done();
        },
        error: done.fail
      });
    });
  });
});
