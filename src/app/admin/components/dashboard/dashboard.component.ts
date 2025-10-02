import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats = { totalEmployees: 0, pendingLeaves: 0, departments: 0, reviews: 0 };
  isSidebarOpen = true; // Set to true by default

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.employeeService.getEmployees().subscribe(data => this.stats.totalEmployees = data.length);
    this.employeeService.getLeaves().subscribe(data => this.stats.pendingLeaves = data.filter((l: any) => l.Status === 'Pending').length);
    this.employeeService.getDepartments().subscribe(data => this.stats.departments = data.length);
    this.employeeService.getReviews().subscribe(data => this.stats.reviews = data.length);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}