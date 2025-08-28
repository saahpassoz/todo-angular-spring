import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanActivate, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect to login when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call authService.isAuthenticated exactly once', () => {
      authService.isAuthenticated.and.returnValue(true);

      guard.canActivate();

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple calls consistently when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result1 = guard.canActivate();
      const result2 = guard.canActivate();
      const result3 = guard.canActivate();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result1 = guard.canActivate();
      const result2 = guard.canActivate();

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle authentication state changes', () => {
      // First call - not authenticated
      authService.isAuthenticated.and.returnValue(false);
      const result1 = guard.canActivate();
      expect(result1).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      // Second call - now authenticated
      authService.isAuthenticated.and.returnValue(true);
      const result2 = guard.canActivate();
      expect(result2).toBe(true);
    });
  });

  describe('route protection behavior', () => {
    it('should implement CanActivate interface', () => {
      expect(guard.canActivate).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should be injectable as a guard', () => {
      expect(guard instanceof AuthGuard).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle authService throwing an error', () => {
      authService.isAuthenticated.and.throwError('Auth service error');

      expect(() => guard.canActivate()).toThrow();
    });

    it('should handle router navigation errors gracefully', () => {
      authService.isAuthenticated.and.returnValue(false);
      router.navigate.and.throwError('Navigation error');

      expect(() => guard.canActivate()).toThrow();
    });
  });
});
