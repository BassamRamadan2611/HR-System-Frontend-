import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LeaveRequestComponent } from './components/leave-request/leave-request.component';
import { AuthGuard } from '../shared/guards/auth.guard';
import { AttendanceRequestComponent } from './components/attendance-request/attendance-request.component';
import { DepartmentManagementComponent } from './components/department-management/department-management.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['user', 'manager'] }},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { roles: ['user', 'manager'] }},
    { path: 'team', component: DepartmentManagementComponent, canActivate: [AuthGuard], data: { roles: [ 'manager'] }},

  { path: 'leave-request', component: LeaveRequestComponent, canActivate: [AuthGuard], data: { roles: ['user', 'manager'] } },
    { path: 'attendance-request', component: AttendanceRequestComponent, canActivate: [AuthGuard], data: { roles: ['user', 'manager'] } }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}