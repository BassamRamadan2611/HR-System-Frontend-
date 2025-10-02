import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { Username: '', Password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    console.log('Login credentials:', this.credentials);
    
    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        
        // Store the token if it's in the response
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('Token stored in localStorage');
        }
        
        // Debug the token
        this.authService.debugToken();
        
        // Check authentication and role
        console.log('Is authenticated:', this.authService.isAuthenticated());
        console.log('User role:', this.authService.getUserRole());
        console.log('Is admin:', this.authService.isAdmin());
        
        // Navigate based on role
        if (this.authService.isAdmin()) {
          console.log('Navigating to admin dashboard');
          this.router.navigate(['/admin']);
        } 
         else    if (this.authService.isManager()) {
          console.log('Navigating to manger dashboard');
          this.router.navigate(['/user']);
        }
        else {
          console.log('Navigating to user dashboard');
          this.router.navigate(['/user']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        alert(err.error?.error || 'Login failed');
      }
    });
  }
}