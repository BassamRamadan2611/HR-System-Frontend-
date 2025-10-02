import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html'
})
export class DepartmentManagementComponent implements OnInit {
  departments: any[] = [];
  employees: any[] = [];
  availableManagers: any[] = [];
  newDepartment = { 
    DepartmentName: '', 
    ManagerID: null, 
    Description: '' 
  };
  editingDepartment: any = null;
  isSidebarOpen = true;
  
  // Modal states
  showDeleteModal = false;
  showSuccessModal = false;
  departmentToDelete: any = null;
  successMessage = '';

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (data: any) => {
        this.departments = data;
        this.updateAvailableManagers();
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        this.employees = data;
        this.updateAvailableManagers();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  updateAvailableManagers() {
    // Filter employees who can be managers (e.g., not already managers, have certain job titles, etc.)
    this.availableManagers = this.employees.filter(emp => 
      // Add your logic for who can be a manager
      // For example: emp.JobTitle.includes('Manager') || emp.JobTitle.includes('Lead') || emp.JobTitle.includes('Director')
      true // For now, all employees can be managers
    );
  }

  saveDepartment() {
    if (this.editingDepartment) {
      this.employeeService.updateDepartment(this.editingDepartment.DepartmentID, this.newDepartment).subscribe({
        next: () => {
          this.showSuccess('Department updated successfully');
          this.resetForm();
          this.loadDepartments();
        },
        error: (err) => console.error('Error updating department:', err)
      });
    } else {
      this.employeeService.addDepartment(this.newDepartment).subscribe({
        next: () => {
          this.showSuccess('Department added successfully');
          this.resetForm();
          this.loadDepartments();
        },
        error: (err) => console.error('Error adding department:', err)
      });
    }
  }

  editDepartment(dept: any) {
    this.editingDepartment = dept;
    this.newDepartment = { 
      DepartmentName: dept.DepartmentName, 
      ManagerID: dept.ManagerID,
      Description: dept.Description || ''
    };
  }

  openDeleteModal(dept: any) {
    this.departmentToDelete = dept;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.departmentToDelete = null;
  }

  confirmDelete() {
    if (this.departmentToDelete) {
      this.employeeService.deleteDepartment(this.departmentToDelete.DepartmentID).subscribe({
        next: () => {
          this.showSuccess('Department deleted successfully');
          this.closeDeleteModal();
          this.loadDepartments();
        },
        error: (err) => console.error('Error deleting department:', err)
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.newDepartment = { 
      DepartmentName: '', 
      ManagerID: null, 
      Description: '' 
    };
    this.editingDepartment = null;
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessModal = true;
  }

  // Helper methods
  getEmployeeCount(departmentId: number): number {
    return this.employees.filter(emp => emp.DepartmentID === departmentId).length;
  }

  getTotalEmployees(): number {
    return this.employees.length;
  }

  getAverageDeptSize(): number {
    if (this.departments.length === 0) return 0;
    const totalEmployees = this.getTotalEmployees();
    return Math.round(totalEmployees / this.departments.length);
  }

  getAssignedManagersCount(): number {
    return this.departments.filter(dept => dept.ManagerID !== null).length;
  }

  getManagerName(managerId: number): string {
    const manager = this.employees.find(emp => emp.EmployeeID === managerId);
    return manager ? `${manager.FirstName} ${manager.LastName}` : 'Unknown Manager';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}