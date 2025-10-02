import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any = {};
  originalUser: any = {};
  isSidebarOpen = true;
  showSuccessModal = false;
  isLoading = false;
  
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.user = response.profile;
        this.originalUser = { ...this.user };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        alert(err.error?.error || 'Failed to load profile');
        this.isLoading = false;
      }
    });
  }

  updateProfile() {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    const profileData = {
      FirstName: this.user.FirstName,
      LastName: this.user.LastName,
      Email: this.user.Email,
      Phone: this.user.Phone,
      DateOfBirth: this.user.DateOfBirth
    };

    this.authService.updateProfile(profileData).subscribe({
      next: () => {
        this.showSuccessModal = true;
        this.originalUser = { ...this.user };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert(err.error?.error || 'Failed to update profile');
        this.isLoading = false;
      }
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    this.isLoading = true;
    this.authService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        alert('Password changed successfully!');
        this.resetPasswordForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error changing password:', err);
        alert(err.error?.error || 'Failed to change password');
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.user = { ...this.originalUser };
  }

  resetPasswordForm() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  isFormValid(): boolean {
    return !!this.user.FirstName && 
           !!this.user.LastName && 
           !!this.user.Email &&
           this.isValidEmail(this.user.Email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  calculateYearsOfService(): string {
    if (!this.user.HireDate) return '0';
    
    const hireDate = new Date(this.user.HireDate);
    const today = new Date();
    const years = today.getFullYear() - hireDate.getFullYear();
    const months = today.getMonth() - hireDate.getMonth();
    
    if (months < 0) {
      return (years - 1) + '.' + (12 + months);
    }
    
    return years + '.' + months;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}