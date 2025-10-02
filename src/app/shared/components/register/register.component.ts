import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export interface User {
  Username: string;
  Password: string;
  Role: string;
  EmployeeID: number;
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // Reference the CSS file
})
export class RegisterComponent {
  user :User= { Username: '', Password: '', Role: '', EmployeeID:0 };

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.user).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert(err.error.error)
    });
  }
}