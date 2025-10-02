import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LeaveRequestComponent } from './components/leave-request/leave-request.component';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './components/profile/profile.component';
import { AttendanceRequestComponent } from './components/attendance-request/attendance-request.component';
import { DepartmentManagementComponent } from './components/department-management/department-management.component';
import { UserSidebarComponent } from './components/user-sidebar/user-sidebar.component';


@NgModule({
  declarations: [
    DashboardComponent,
    LeaveRequestComponent,
    ProfileComponent,
    AttendanceRequestComponent,
    DepartmentManagementComponent,
    UserSidebarComponent
    
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule
  ]
})
export class UserModule { }
