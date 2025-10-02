import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  user: any = {};
  attendance: any[] = [];
  leaves: any[] = [];
  payrolls: any[] = [];
  attendanceRequests: any[] = []; // New: Attendance requests array
  lastAttendance: any = null;
  isSidebarOpen = true;
  
  // Modal states
  showCheckOutModal = false;
  showEditLeaveModal = false;
  showCancelLeaveModal = false;
  showEditAttendanceRequestModal = false; // New: Edit attendance request modal
  showCancelAttendanceRequestModal = false; // New: Cancel attendance request modal
  showSuccessModal = false;
  
  // Leave management
  selectedLeave: any = null;
  leaveToCancel: any = null;
  editLeaveData: any = {};
  leaveTypes: any[] = [];

  // Attendance request management - New
  selectedAttendanceRequest: any = null;
  attendanceRequestToCancel: any = null;
  editAttendanceRequestData: any = {};
  attendanceRequestTypes: any[] = [];

  successMessage = '';

  // Loading states
  isLoading = {
    leaves: false,
    attendance: false,
    payroll: false,
    employee: false,
    attendanceRequests: false // New: Attendance requests loading state
  };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const employeeId = this.authService.getEmployeeId();
    if (employeeId) {
      this.isLoading.employee = true;
      this.isLoading.leaves = true;
      this.isLoading.attendance = true;
      this.isLoading.payroll = true;
      this.isLoading.attendanceRequests = true; // New: Set loading state

      // Load employee data
      this.employeeService.getEmployee(employeeId).subscribe({
        next: (data) => {
          this.user = data;
          this.isLoading.employee = false;
        },
        error: (err) => {
          console.error('Error loading employee:', err);
          this.user = { FirstName: 'User', LastName: '' };
          this.isLoading.employee = false;
        }
      });

      // Load attendance data
      this.employeeService.getAttendance().subscribe({
        next: (data) => {
          this.attendance = Array.isArray(data) ? data.filter((att: any) => att.EmployeeID === employeeId) : [];
          this.findTodayAttendance();
          this.isLoading.attendance = false;
        },
        error: (err) => {
          console.error('Error loading attendance:', err);
          this.attendance = [];
          this.isLoading.attendance = false;
        }
      });

      // Load employee's leaves only
      this.employeeService.getEmployeeLeaves(employeeId).subscribe({
        next: (data) => {
          console.log(data)
          this.leaves = Array.isArray(data) ? data : [];
          this.isLoading.leaves = false;
        },
        error: (err) => {
          console.error('Error loading leaves:', err);
          this.leaves = [];
          this.isLoading.leaves = false;
        }
      });

      // Load payroll data
      this.employeeService.getPayrolls().subscribe({
        next: (data) => {
          this.payrolls = Array.isArray(data) ? data.filter((payroll: any) => payroll.EmployeeID === employeeId) : [];
          this.isLoading.payroll = false;
        },
        error: (err) => {
          console.error('Error loading payrolls:', err);
          this.payrolls = [];
          this.isLoading.payroll = false;
        }
      });

      // Load leave types for editing
      this.employeeService.getLeaveTypes().subscribe({
        next: (data) => {
          this.leaveTypes = data || [];
        },
        error: (err) => {
          console.error('Error loading leave types:', err);
          this.leaveTypes = [];
        }
      });

      // NEW: Load attendance requests for employee
      this.employeeService.getEmployeeAttendanceRequests(employeeId).subscribe({
        next: (data) => {
          this.attendanceRequests = Array.isArray(data) ? data : [];
          this.isLoading.attendanceRequests = false;
        },
        error: (err) => {
          console.error('Error loading attendance requests:', err);
          this.attendanceRequests = [];
          this.isLoading.attendanceRequests = false;
        }
      });

      // NEW: Load attendance request types
      this.employeeService.getAttendanceRequestTypes().subscribe({
        next: (data) => {
          this.attendanceRequestTypes = data || [];
        },
        error: (err) => {
          console.error('Error loading attendance request types:', err);
          this.attendanceRequestTypes = [];
        }
      });
    }
  }

  // ========== LEAVE MANAGEMENT METHODS ==========
  openEditLeaveModal(leave: any) {
    this.selectedLeave = leave;
    this.editLeaveData = {
      LeaveTypeID: leave.LeaveTypeID,
      StartDate: this.formatDateForInput(leave.StartDate),
      EndDate: this.formatDateForInput(leave.EndDate),
      Reason: leave.Reason || ''
    };
    this.showEditLeaveModal = true;
  }

  closeEditLeaveModal() {
    this.showEditLeaveModal = false;
    this.selectedLeave = null;
    this.editLeaveData = {};
  }

  updateLeave() {
    if (!this.selectedLeave) return;

    // Format dates for backend
    const formattedData = {
      ...this.editLeaveData,
      StartDate: this.formatDateForSQL(this.editLeaveData.StartDate),
      EndDate: this.formatDateForSQL(this.editLeaveData.EndDate)
    };
    console.log(formattedData,this.selectedLeave.LeaveID)
    this.employeeService.updateLeave(this.selectedLeave.LeaveID, formattedData).subscribe({
      next: (response) => {
        this.successMessage = 'Leave updated successfully!';
        this.showSuccessModal = true;
        this.closeEditLeaveModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error updating leave:', err);
        alert(err.error?.error || 'Failed to update leave');
      }
    });
  }

  openCancelLeaveModal(leave: any) {
    this.leaveToCancel = leave;
    this.showCancelLeaveModal = true;
  }

  closeCancelLeaveModal() {
    this.showCancelLeaveModal = false;
    this.leaveToCancel = null;
  }

  confirmCancelLeave() {
    if (!this.leaveToCancel) return;

    this.employeeService.cancelLeave(this.leaveToCancel.LeaveID).subscribe({
      next: (response) => {
        this.successMessage = 'Leave canceled successfully!';
        this.showSuccessModal = true;
        this.closeCancelLeaveModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error canceling leave:', err);
        alert(err.error?.error || 'Failed to cancel leave');
      }
    });
  }

  // ========== ATTENDANCE REQUEST MANAGEMENT METHODS ==========
  openEditAttendanceRequestModal(request: any) {
    this.selectedAttendanceRequest = request;
    this.editAttendanceRequestData = {
      RequestTypeID: request.RequestTypeID,
      RequestDate: this.formatDateForInput(request.RequestDate),
      StartTime: request.StartTime || '',
      EndTime: request.EndTime || '',
      Reason: request.Reason || ''
    };
    this.showEditAttendanceRequestModal = true;
  }

  closeEditAttendanceRequestModal() {
    this.showEditAttendanceRequestModal = false;
    this.selectedAttendanceRequest = null;
    this.editAttendanceRequestData = {};
  }

  updateAttendanceRequest() {
    if (!this.selectedAttendanceRequest) return;

    // Format data for backend
    const formattedData = {
      ...this.editAttendanceRequestData,
      RequestDate: this.formatDateForSQL(this.editAttendanceRequestData.RequestDate)
    };

    this.employeeService.updateAttendanceRequest(this.selectedAttendanceRequest.RequestID, formattedData).subscribe({
      next: (response) => {
        this.successMessage = 'Attendance request updated successfully!';
        this.showSuccessModal = true;
        this.closeEditAttendanceRequestModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error updating attendance request:', err);
        alert(err.error?.error || 'Failed to update attendance request');
      }
    });
  }

  openCancelAttendanceRequestModal(request: any) {
    this.attendanceRequestToCancel = request;
    this.showCancelAttendanceRequestModal = true;
  }

  closeCancelAttendanceRequestModal() {
    this.showCancelAttendanceRequestModal = false;
    this.attendanceRequestToCancel = null;
  }

  confirmCancelAttendanceRequest() {
    if (!this.attendanceRequestToCancel) return;

    this.employeeService.cancelAttendanceRequest(this.attendanceRequestToCancel.RequestID).subscribe({
      next: (response) => {
        this.successMessage = 'Attendance request canceled successfully!';
        this.showSuccessModal = true;
        this.closeCancelAttendanceRequestModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error canceling attendance request:', err);
        alert(err.error?.error || 'Failed to cancel attendance request');
      }
    });
  }

  // ========== HELPER METHODS ==========
  // Check if leave can be edited (only pending leaves)
  canEditLeave(leave: any): boolean {
    return leave.Status === 'Pending';
  }

  // Check if leave can be canceled (only pending leaves)
  canCancelLeave(leave: any): boolean {
    return leave.Status === 'Pending';
  }

  // Check if attendance request can be edited (only pending requests)
  canEditAttendanceRequest(request: any): boolean {
    return request.Status === 'Pending';
  }

  // Check if attendance request can be canceled (only pending requests)
  canCancelAttendanceRequest(request: any): boolean {
    return request.Status === 'Pending';
  }

  // Format date for HTML input (YYYY-MM-DD)
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Format date for SQL (YYYY-MM-DD)
  formatDateForSQL(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Calculate leave days for display
  calculateLeaveDays(startDate: string, endDate: string): number {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch (e) {
      return 0;
    }
  }

  // Format time for display
  formatTime(time: string): string {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case 'Approved': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'Rejected': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'Pending': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  // Get leave type color
  getLeaveTypeColor(typeName: string): string {
    const colors: { [key: string]: string } = {
      'Sick Leave': 'bg-red-100 text-red-800',
      'Vacation': 'bg-blue-100 text-blue-800',
      'Personal': 'bg-purple-100 text-purple-800',
      'Emergency': 'bg-orange-100 text-orange-800',
      'Maternity': 'bg-pink-100 text-pink-800',
      'Paternity': 'bg-indigo-100 text-indigo-800'
    };
    return colors[typeName] || 'bg-gray-100 text-gray-800';
  }

  // Get attendance request type color
  getAttendanceRequestTypeColor(typeName: string): string {
    const colors: { [key: string]: string } = {
      'Work From Home': 'bg-blue-100 text-blue-800',
      'Early Departure': 'bg-orange-100 text-orange-800',
      'Late Arrival': 'bg-yellow-100 text-yellow-800',
      'Short Absence': 'bg-purple-100 text-purple-800',
      'Overtime Request': 'bg-green-100 text-green-800'
    };
    return colors[typeName] || 'bg-gray-100 text-gray-800';
  }

  // Check if request requires time input
  requiresTimeInput(request: any): boolean {
    const timeBasedTypes = ['Early Departure', 'Late Arrival', 'Short Absence', 'Overtime Request'];
    return request && timeBasedTypes.includes(request.TypeName);
  }

  // ========== EXISTING METHODS ==========
  findTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    this.lastAttendance = this.attendance.find(att => {
      const attDate = new Date(att.Date).toISOString().split('T')[0];
      return attDate === today;
    });
  }

  checkIn() {
    const employeeId = this.authService.getEmployeeId();
    if (employeeId) {
      this.employeeService.checkIn(employeeId).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error checking in:', err);
          alert(err.error?.error || 'Failed to check in');
        }
      });
    }
  }

  openCheckOutModal() {
    this.showCheckOutModal = true;
  }

  closeCheckOutModal() {
    this.showCheckOutModal = false;
  }

  confirmCheckOut() {
    if (this.lastAttendance) {
      this.employeeService.checkOut(this.lastAttendance.AttendanceID).subscribe({
        next: () => {
          this.closeCheckOutModal();
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error checking out:', err);
          alert(err.error?.error || 'Failed to check out');
        }
      });
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.successMessage = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  getPendingLeavesCount(): number {
    return this.leaves.filter(leave => leave.Status === 'Pending').length;
  }

  getApprovedLeavesCount(): number {
    return this.leaves.filter(leave => leave.Status === 'Approved').length;
  }

  getPendingAttendanceRequestsCount(): number { // New
    return this.attendanceRequests.filter(request => request.Status === 'Pending').length;
  }

  getApprovedAttendanceRequestsCount(): number { // New
    return this.attendanceRequests.filter(request => request.Status === 'Approved').length;
  }

  getLatestPayroll(): number {
    if (this.payrolls.length === 0) return 0;
    const sortedPayrolls = [...this.payrolls].sort((a, b) => {
      const dateA = new Date(`${a.Year}-${a.Month}-01`);
      const dateB = new Date(`${b.Year}-${b.Month}-01`);
      return dateB.getTime() - dateA.getTime();
    });
    return sortedPayrolls[0]?.NetSalary || 0;
  }

  canCheckIn(): boolean {
    return !this.lastAttendance;
  }

  canCheckOut(): boolean {
    return this.lastAttendance && this.lastAttendance.CheckInTime && !this.lastAttendance.CheckOutTime;
  }

  getTodayStatus(): string {
    if (!this.lastAttendance) return 'Not Checked In';
    if (this.lastAttendance.CheckOutTime) return 'Completed';
    if (this.lastAttendance.CheckInTime) return 'Checked In';
    return this.lastAttendance.Status || 'Unknown';
  }

  getTodayStatusMessage(): string {
    if (!this.lastAttendance) return 'No attendance record for today';
    if (this.lastAttendance.CheckOutTime) return `Checked out at ${this.lastAttendance.CheckOutTime}`;
    if (this.lastAttendance.CheckInTime) return `Checked in at ${this.lastAttendance.CheckInTime}`;
    return 'Attendance recorded';
  }

  // Get recent leaves (last 5)
  getRecentLeaves() {
    return this.leaves.slice(0, 5);
  }

  // Get recent attendance requests (last 5) - New
  getRecentAttendanceRequests() {
    return this.attendanceRequests.slice(0, 5);
  }

  // Check if there are any leaves
  hasLeaves(): boolean {
    return this.leaves.length > 0;
  }

  // Check if there are any attendance requests - New
  hasAttendanceRequests(): boolean {
    return this.attendanceRequests.length > 0;
  }

    toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  onSidebarToggled(isOpen: boolean) {
    this.isSidebarOpen = isOpen;
  }
}