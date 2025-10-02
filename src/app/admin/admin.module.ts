import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { FormsModule } from '@angular/forms';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';
import { PayrollManagementComponent } from './components/payroll-management/payroll-management.component';
import { PerformanceReviewComponent } from './components/performance-review/performance-review.component';
import { DepartmentManagementComponent } from './components/department-management/department-management.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { AttendanceManagementComponent } from './components/attendance-management/attendance-management.component';


@NgModule({
  declarations: [
    DashboardComponent,
    EmployeeListComponent,
    LeaveManagementComponent,
    PayrollManagementComponent,
    PerformanceReviewComponent,
    DepartmentManagementComponent,
    UsersManagementComponent,
    AttendanceManagementComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
     
  ]
})
export class AdminModule { }
