// admin.guard.ts (updated)
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // NEW: Allow both admin and manager to access admin panel
    if (this.authService.isAdmin() || this.authService.isManager()) {
      return true;
    }
    this.router.navigate(['/user']);
    return false;
  }
}