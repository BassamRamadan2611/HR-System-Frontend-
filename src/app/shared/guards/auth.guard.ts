// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // NEW: Support for manager role
    if (expectedRole === 'admin' && userRole !== 'admin' && userRole !== 'manager') {
      this.router.navigate(['/user']);
      return false;
    }

    // Existing logic - won't break anything
    if (expectedRole && userRole !== expectedRole) {
      if (userRole === 'user' || userRole === 'employee') {
        this.router.navigate(['/user']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}
