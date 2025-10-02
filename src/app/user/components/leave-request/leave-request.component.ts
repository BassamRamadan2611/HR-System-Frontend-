import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html'
})
export class LeaveRequestComponent implements OnInit {
  leaveTypes: any[] = [];
  newLeave = {
    EmployeeID: null as number | null,
    LeaveTypeID: null as number | null,
    StartDate: '',
    EndDate: '',
    Reason: ''
  };

  isSidebarOpen = true;
  leaveDays = 0;
  minDate = new Date().toISOString().split('T')[0];
  showSuccessModal = false;
  isLoading = false;

  constructor(
    public authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLeaveTypes();
    this.newLeave.EmployeeID = this.authService.getEmployeeId();
  }

  loadLeaveTypes() {
    this.employeeService.getLeaveTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data || [];
      },
      error: (err) => {
        console.error('Error loading leave types:', err);
        alert('Failed to load leave types');
      }
    });
  }

  get selectedLeaveType() {
    return this.leaveTypes.find(type => type.LeaveTypeID == this.newLeave.LeaveTypeID);
  }

  calculateLeaveDays() {
    if (this.newLeave.StartDate && this.newLeave.EndDate) {
      const start = new Date(this.newLeave.StartDate);
      const end = new Date(this.newLeave.EndDate);
      
      // Validate date range
      if (end < start) {
        this.leaveDays = 0;
        return;
      }
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      this.leaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      this.leaveDays = 0;
    }
  }

  // Helper method to check if end date is before start date
  isEndDateBeforeStartDate(): boolean {
    if (!this.newLeave.StartDate || !this.newLeave.EndDate) {
      return false;
    }
    const startDate = new Date(this.newLeave.StartDate);
    const endDate = new Date(this.newLeave.EndDate);
    return endDate < startDate;
  }

  // Helper method to check if leave exceeds maximum days
  exceedsMaxDays(): boolean {
    if (!this.selectedLeaveType || this.leaveDays === 0) {
      return false;
    }
    const maxDays = this.selectedLeaveType.MaxDaysPerYear || 30;
    return this.leaveDays > maxDays;
  }

  isFormValid(): boolean {
    return !!this.newLeave.LeaveTypeID && 
           !!this.newLeave.StartDate && 
           !!this.newLeave.EndDate &&
           !this.isEndDateBeforeStartDate() &&
           !!this.newLeave.EmployeeID;
  }

  // Format date for SQL Server (YYYY-MM-DD format)
  formatDateForSQL(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

 requestLeave() {
  if (!this.isFormValid()) {
    alert('Please fill all required fields correctly');
    return;
  }

  if (this.exceedsMaxDays()) {
    const maxDays = this.selectedLeaveType.MaxDaysPerYear || 30;
    if (!confirm(`This leave request (${this.leaveDays} days) exceeds the maximum allowed days (${maxDays} days). Do you want to proceed anyway?`)) {
      return;
    }
  }

  this.isLoading = true;

  if (!this.newLeave.EmployeeID) {
    this.newLeave.EmployeeID = this.authService.getEmployeeId();
  }

  const formattedLeaveRequest = {
    EmployeeID: this.newLeave.EmployeeID,
    LeaveTypeID: this.newLeave.LeaveTypeID,
    StartDate: this.formatDateForSQL(this.newLeave.StartDate),
    EndDate: this.formatDateForSQL(this.newLeave.EndDate),
    Reason: this.newLeave.Reason || ''
  };

  // Log the request for debugging
  console.log('Submitting leave request:', formattedLeaveRequest);

  // Additional validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formattedLeaveRequest.StartDate) || !dateRegex.test(formattedLeaveRequest.EndDate)) {
    this.isLoading = false;
    alert('Invalid date format. Please select valid dates.');
    return;
  }

  this.employeeService.requestLeave(formattedLeaveRequest).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.showSuccessModal = true;
      this.clearForm();
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Error requesting leave:', err);
      alert(err.error?.error || 'Failed to submit leave request');
    }
  });
}

  clearForm() {
    this.newLeave = { 
      EmployeeID: this.authService.getEmployeeId(), 
      LeaveTypeID: null, 
      StartDate: '', 
      EndDate: '',
      Reason: ''
    };
    this.leaveDays = 0;
  }

  goToDashboard() {
    this.showSuccessModal = false;
    this.router.navigate(['/user']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Get max date for end date (start date + 60 days)
  getMaxDate(): string {
    if (this.newLeave.StartDate) {
      const maxDate = new Date(this.newLeave.StartDate);
      maxDate.setDate(maxDate.getDate() + 60);
      return maxDate.toISOString().split('T')[0];
    }
    return '';
  }
}