import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  paginatedEmployees: any[] = [];
  departments: any[] = [];
  availableManagers: any[] = [];
  isSidebarOpen = true;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Filters
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';
  
  // Modal state variables
  showEmployeeModal = false;
  showDeleteModal = false;
  isEditing = false;
  
  // Employee data
  currentEmployee = {
    EmployeeID: null,
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    JobTitle: '',
    Salary: null,
    DepartmentID: null,
    DateOfBirth: '',
    HireDate: '',
    ManagerID: null,
    Status: 'Active'
  };
  
  employeeToDelete: any = null;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe(data => {
      this.employees = data;
      console.log(this.employees)
      this.applyFilters();
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe(data => this.departments = data);
  }

  updateAvailableManagers() {
    // Filter employees who can be managers (existing employees)
    this.availableManagers = this.employees.filter(emp => 
      emp.EmployeeID !== this.currentEmployee.EmployeeID // Exclude current employee if editing
    );
  }

  // Filtering and Pagination
  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = !this.searchTerm || 
        emp.FirstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.LastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.Email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.JobTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (emp.Phone && emp.Phone.includes(this.searchTerm));
      
      const matchesDepartment = !this.selectedDepartment || emp.DepartmentID == this.selectedDepartment;
      const matchesStatus = !this.selectedStatus || emp.Status === this.selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredEmployees.length);
    return `${start}-${end}`;
  }

  // Modal handlers
  openAddModal() {
    this.isEditing = false;
    this.currentEmployee = {
      EmployeeID: null,
      FirstName: '',
      LastName: '',
      Email: '',
      Phone: '',
      JobTitle: '',
      Salary: null,
      DepartmentID: null,
      DateOfBirth: '',
      HireDate: new Date().toISOString().split('T')[0], // Default to today
      ManagerID: null,
      Status: 'Active'
    };
    this.updateAvailableManagers();
    this.showEmployeeModal = true;
  }

  openEditModal(employee: any) {
    this.isEditing = true;
    this.currentEmployee = { 
      ...employee,
      DateOfBirth: this.formatDateForInput(employee.DateOfBirth),
      HireDate: this.formatDateForInput(employee.HireDate)
    };
    this.updateAvailableManagers();
    this.showEmployeeModal = true;
  }

  closeEmployeeModal() {
    this.showEmployeeModal = false;
  }

  openDeleteModal(employee: any) {
    this.employeeToDelete = employee;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
  }

  // CRUD operations
  addEmployee() {
    this.employeeService.addEmployee(this.currentEmployee).subscribe({
      next: () => {
        this.showEmployeeModal = false;
        this.loadEmployees();
      },
      error: (err) => console.error('Error adding employee:', err)
    });
  }

  updateEmployee() {
    if (this.currentEmployee.EmployeeID !== null) {
      this.employeeService.updateEmployee(this.currentEmployee.EmployeeID, this.currentEmployee).subscribe({
        next: () => {
          this.showEmployeeModal = false;
          this.loadEmployees();
        },
        error: (err) => console.error('Error updating employee:', err)
      });
    }
  }

  deleteEmployee() {
    if (this.employeeToDelete) {
      this.employeeService.deleteEmployee(this.employeeToDelete.EmployeeID).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.loadEmployees();
        },
        error: (err) => console.error('Error deleting employee:', err)
      });
    }
  }

  // Helper methods
  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(dept => dept.DepartmentID === departmentId);
    return department ? department.DepartmentName : 'N/A';
  }

  getAverageSalary(): number {
    if (this.employees.length === 0) return 0;
    const total = this.employees.reduce((sum, emp) => sum + (emp.Salary || 0), 0);
    return total / this.employees.length;
  }

  getActiveEmployeesCount(): number {
    return this.employees.filter(emp => emp.Status === 'Active').length;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Math function for template
  Math = Math;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}