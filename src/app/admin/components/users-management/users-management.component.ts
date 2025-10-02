import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html'
})
export class UsersManagementComponent implements OnInit {
  users: any[] = [];
  employees: any[] = [];
  availableEmployees: any[] = [];
  isSidebarOpen = true;
  
  // Modal states
  showDeleteModal = false;
  showSuccessModal = false;
  showEditModal = false;
  
  userToDelete: any = null;
  userToEdit: any = null;
  
  successMessage = '';

  // New user data
  newUser: any = {
    Username: '',
    Password: '',
    EmployeeID: null,
    Role: ''
  };

  // Edit user data
  editUserData: any = {
    Username: '',
    Role: '',
    IsActive: true
  };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadEmployees();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.users;
        this.updateAvailableEmployees();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        alert('Failed to load users');
      }
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.updateAvailableEmployees();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  updateAvailableEmployees() {
    // Filter employees who don't have user accounts yet
    const usersWithEmployeeIds = this.users.map(user => user.EmployeeID).filter(id => id);
    this.availableEmployees = this.employees.filter(emp => 
      !usersWithEmployeeIds.includes(emp.EmployeeID)
    );
  }

  addUser() {
    if (!this.isNewUserValid()) {
      alert('Please fill in all required fields. Password must be at least 6 characters.');
      return;
    }

    this.authService.register(this.newUser).subscribe({
      next: (response) => {
        this.showSuccess('User created successfully');
        this.resetNewUserForm();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        alert(err.error?.error || 'Failed to create user');
      }
    });
  }

// In your component's editUser method
editUser(user: any) {
  this.userToEdit = user;
  this.editUserData = {
    Username: user.Username,
    Role: user.Role,
    IsActive: user.IsActive !== undefined ? user.IsActive : true // Default to true if not set
  };
  this.showEditModal = true;
}
  updateUser() {
    if (!this.userToEdit) return;

    this.authService.updateUser(this.userToEdit.UserID, this.editUserData).subscribe({
      next: (response) => {
        this.showSuccess('User updated successfully');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert(err.error?.error || 'Failed to update user');
      }
    });
  }

  openDeleteModal(user: any) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.userToEdit = null;
    this.editUserData = {
      Username: '',
      Role: '',
      IsActive: true
    };
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.authService.deleteUser(this.userToDelete.UserID).subscribe({
        next: (response) => {
          this.showSuccess('User deleted successfully');
          this.closeDeleteModal();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert(err.error?.error || 'Failed to delete user');
          this.closeDeleteModal();
        }
      });
    }
  }

  isNewUserValid(): boolean {
    return !!this.newUser.Username && 
           !!this.newUser.Password && 
           !!this.newUser.EmployeeID && 
           !!this.newUser.Role &&
           this.newUser.Password.length >= 6;
  }

  resetNewUserForm() {
    this.newUser = {
      Username: '',
      Password: '',
      EmployeeID: null,
      Role: ''
    };
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessModal = true;
  }

  // Statistics methods
  getAdminsCount(): number {
    return this.users.filter(user => user.Role === 'admin').length;
  }

  getManagersCount(): number {
    return this.users.filter(user => user.Role === 'manager').length;
  }

  getEmployeesCount(): number {
    return this.users.filter(user => user.Role === 'employee').length;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}