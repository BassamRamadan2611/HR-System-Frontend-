import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-attendance-request',
  templateUrl: './attendance-request.component.html'
})
export class AttendanceRequestComponent implements OnInit {
  requestTypes: any[] = [];
  employeeLeaves: any[] = []; // Store employee's approved leaves
  newRequest = {
    EmployeeID: null as number | null,
    RequestTypeID: null as number | null,
    RequestDate: '',
    StartTime: '',
    EndTime: '',
    Reason: ''
  };

  isSidebarOpen = true;
  totalHours = 0;
  minDate = new Date().toISOString().split('T')[0];
  showSuccessModal = false;
  isLoading = false;
  hasLeaveConflict = false; // Track leave conflicts

  constructor(
    public authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRequestTypes();
    this.loadEmployeeLeaves(); // Load employee leaves on init
    this.newRequest.EmployeeID = this.authService.getEmployeeId();
  }

  loadRequestTypes() {
    this.employeeService.getAttendanceRequestTypes().subscribe({
      next: (data) => {
        this.requestTypes = data || [];
      },
      error: (err) => {
        console.error('Error loading request types:', err);
        alert('Failed to load request types');
      }
    });
  }

  loadEmployeeLeaves() {
    const employeeId = this.authService.getEmployeeId();
    if (employeeId) {
      this.employeeService.getEmployeeLeaves(employeeId).subscribe({
        next: (data) => {
          this.employeeLeaves = data || [];
          console.log('Loaded employee leaves:', this.employeeLeaves);
        },
        error: (err) => {
          console.error('Error loading employee leaves:', err);
        }
      });
    }
  }

  // Check if the selected date conflicts with approved leaves
  checkLeaveConflict(): boolean {
    if (!this.newRequest.RequestDate || !this.employeeLeaves.length) {
      this.hasLeaveConflict = false;
      return false;
    }

    const selectedDate = new Date(this.newRequest.RequestDate);
    
    const conflict = this.employeeLeaves.some(leave => {
      if (leave.Status !== 'Approved') return false;
      
      const startDate = new Date(leave.StartDate);
      const endDate = new Date(leave.EndDate);
      
      // Check if selected date falls within any approved leave period
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    this.hasLeaveConflict = conflict;
    return conflict;
  }

  get selectedRequestType() {
    return this.requestTypes.find(type => type.RequestTypeID == this.newRequest.RequestTypeID);
  }

  calculateTotalHours() {
    if (this.newRequest.StartTime && this.newRequest.EndTime) {
      const start = new Date(`1970-01-01T${this.newRequest.StartTime}`);
      const end = new Date(`1970-01-01T${this.newRequest.EndTime}`);
      
      if (end <= start) {
        this.totalHours = 0;
        return;
      }
      
      const diffMs = end.getTime() - start.getTime();
      this.totalHours = diffMs / (1000 * 60 * 60);
    } else {
      this.totalHours = 0;
    }
  }

  // Check date change for leave conflicts
  onDateChange() {
    this.checkLeaveConflict();
  }

  isEndTimeBeforeStartTime(): boolean {
    if (!this.newRequest.StartTime || !this.newRequest.EndTime) {
      return false;
    }
    const startTime = new Date(`1970-01-01T${this.newRequest.StartTime}`);
    const endTime = new Date(`1970-01-01T${this.newRequest.EndTime}`);
    return endTime <= startTime;
  }

  exceedsMaxHours(): boolean {
    if (!this.selectedRequestType || this.totalHours === 0) {
      return false;
    }
    const maxHours = this.selectedRequestType.MaxHoursPerRequest || 8;
    return this.totalHours > maxHours;
  }

  isFormValid(): boolean {
    const hasRequiredFields = !!this.newRequest.RequestTypeID && 
                             !!this.newRequest.RequestDate &&
                             !!this.newRequest.EmployeeID;

    // Check for leave conflict
    if (this.hasLeaveConflict) {
      return false;
    }

    // For time-based requests, validate times
    if (this.selectedRequestType && this.requiresTimeInput()) {
      return hasRequiredFields && 
             !!this.newRequest.StartTime && 
             !!this.newRequest.EndTime &&
             !this.isEndTimeBeforeStartTime();
    }

    return hasRequiredFields;
  }

  requiresTimeInput(): boolean {
    const timeBasedTypes = ['Early Departure', 'Late Arrival', 'Short Absence', 'Overtime Request'];
    return this.selectedRequestType && 
           timeBasedTypes.includes(this.selectedRequestType.TypeName);
  }

  isFullDayRequest(): boolean {
    return this.selectedRequestType && 
           this.selectedRequestType.TypeName === 'Work From Home';
  }

  formatDateForSQL(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  submitAttendanceRequest() {
    if (!this.isFormValid()) {
      if (this.hasLeaveConflict) {
        alert('Cannot submit request: You have approved leave on this date. Please choose a different date.');
      } else {
        alert('Please fill all required fields correctly');
      }
      return;
    }

    // Double-check leave conflict
    if (this.checkLeaveConflict()) {
      alert('Cannot submit request: You have approved leave on this date. Please choose a different date.');
      return;
    }

    if (this.exceedsMaxHours()) {
      const maxHours = this.selectedRequestType.MaxHoursPerRequest || 8;
      if (!confirm(`This request (${this.totalHours.toFixed(2)} hours) exceeds the maximum allowed hours (${maxHours} hours). Do you want to proceed anyway?`)) {
        return;
      }
    }

    this.isLoading = true;

    if (!this.newRequest.EmployeeID) {
      this.newRequest.EmployeeID = this.authService.getEmployeeId();
    }

    const formattedRequest = {
      EmployeeID: this.newRequest.EmployeeID,
      RequestTypeID: this.newRequest.RequestTypeID,
      RequestDate: this.formatDateForSQL(this.newRequest.RequestDate),
      StartTime: this.newRequest.StartTime || null,
      EndTime: this.newRequest.EndTime || null,
      Reason: this.newRequest.Reason || ''
    };

    console.log('Submitting attendance request:', formattedRequest);

    // Additional validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formattedRequest.RequestDate)) {
      this.isLoading = false;
      alert('Invalid date format. Please select a valid date.');
      return;
    }

    this.employeeService.submitAttendanceRequest(formattedRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccessModal = true;
        this.clearForm();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error submitting attendance request:', err);
        
        // Handle specific error messages
        if (err.error?.error?.includes('approved leave')) {
          alert('Cannot submit request: You have approved leave on this date. Please choose a different date.');
          this.hasLeaveConflict = true;
        } else if (err.error?.error?.includes('pending request')) {
          alert('You already have a pending request for this date. Please wait for approval or cancel the existing request.');
        } else {
          alert(err.error?.error || 'Failed to submit attendance request');
        }
      }
    });
  }

  clearForm() {
    this.newRequest = { 
      EmployeeID: this.authService.getEmployeeId(), 
      RequestTypeID: null, 
      RequestDate: '', 
      StartTime: '',
      EndTime: '',
      Reason: ''
    };
    this.totalHours = 0;
    this.hasLeaveConflict = false;
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

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Get conflicting leave information for display
  getConflictLeaveInfo(): string {
    if (!this.hasLeaveConflict || !this.newRequest.RequestDate) return '';
    
    const selectedDate = new Date(this.newRequest.RequestDate);
    const conflictLeave = this.employeeLeaves.find(leave => {
      if (leave.Status !== 'Approved') return false;
      const startDate = new Date(leave.StartDate);
      const endDate = new Date(leave.EndDate);
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    if (conflictLeave) {
      const startDate = new Date(conflictLeave.StartDate).toLocaleDateString();
      const endDate = new Date(conflictLeave.EndDate).toLocaleDateString();
      return `You have approved ${conflictLeave.TypeName} leave from ${startDate} to ${endDate}`;
    }

    return '';
  }
}