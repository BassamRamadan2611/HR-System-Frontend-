import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';
import { PayrollManagementComponent } from './components/payroll-management/payroll-management.component';
import { PerformanceReviewComponent } from './components/performance-review/performance-review.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { DepartmentManagementComponent } from './components/department-management/department-management.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { AttendanceManagementComponent } from './components/attendance-management/attendance-management.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
    { path: 'departments', component: DepartmentManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'employees', component: EmployeeListComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
    { path: 'users', component: UsersManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },

  { path: 'leaves', component: LeaveManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'attendance', component: AttendanceManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },

  { path: 'payroll', component: PayrollManagementComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'reviews', component: PerformanceReviewComponent, canActivate: [AuthGuard], data: { role: 'admin' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}