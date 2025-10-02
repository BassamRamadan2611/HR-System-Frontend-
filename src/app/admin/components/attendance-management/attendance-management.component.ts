import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-attendance-management',
  templateUrl: './attendance-management.component.html'
})
export class AttendanceManagementComponent implements OnInit {
  // Attendance records (check-in/check-out)
  attendanceRecords: any[] = [];
  filteredAttendance: any[] = [];
  
  // Attendance requests (WFH, Late Arrival, etc.)
  attendanceRequests: any[] = [];
  filteredRequests: any[] = [];
  
  employees: any[] = [];
  attendanceRequestTypes: any[] = [];
  isSidebarOpen = true;
  
  // Active tab
  activeTab: 'records' | 'requests' = 'records';
  
  // Modal states
  showApproveModal = false;
  showRejectModal = false;
  showDeleteModal = false;
  selectedRecord: any = null;
  selectedRequest: any = null;
  rejectReason = '';

  // Filters for records
  recordFilters = {
    employee: '',
    dateRange: '',
    status: '',
    search: ''
  };

  // Filters for requests
  requestFilters = {
    employee: '',
    requestType: '',
    status: '',
    dateRange: '',
    search: ''
  };

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAttendanceRecords();
    this.loadAttendanceRequests();
    this.loadEmployees();
    this.loadAttendanceRequestTypes();
  }

  loadAttendanceRecords() {
    this.employeeService.getAttendance().subscribe(data => {
      this.attendanceRecords = data;
      this.applyRecordFilters();
    });
  }

  loadAttendanceRequests() {
    this.employeeService.getAttendanceRequests().subscribe(data => {
      this.attendanceRequests = data;
      this.applyRequestFilters();
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe(data => {
      this.employees = data;
    });
  }

  loadAttendanceRequestTypes() {
    this.employeeService.getAttendanceRequestTypes().subscribe(data => {
      this.attendanceRequestTypes = data;
    });
  }

  // Filter methods for records
  applyRecordFilters() {
    this.filteredAttendance = this.attendanceRecords.filter(record => {
      const matchesEmployee = !this.recordFilters.employee || record.EmployeeID == this.recordFilters.employee;
      const matchesStatus = !this.recordFilters.status || this.getAttendanceStatus(record) === this.recordFilters.status;
      const matchesSearch = !this.recordFilters.search || 
        `${record.FirstName} ${record.LastName}`.toLowerCase().includes(this.recordFilters.search.toLowerCase());
      
      let matchesDate = true;
      if (this.recordFilters.dateRange) {
        const recordDate = new Date(record.Date || record.CheckInTime);
        const today = new Date();
        
        switch (this.recordFilters.dateRange) {
          case 'today':
            matchesDate = recordDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            matchesDate = recordDate >= weekStart;
            break;
          case 'month':
            matchesDate = recordDate.getMonth() === today.getMonth() && 
                         recordDate.getFullYear() === today.getFullYear();
            break;
        }
      }
      
      return matchesEmployee && matchesStatus && matchesSearch && matchesDate;
    });
  }

  // Filter methods for requests
  applyRequestFilters() {
    this.filteredRequests = this.attendanceRequests.filter(request => {
      const matchesEmployee = !this.requestFilters.employee || request.EmployeeID == this.requestFilters.employee;
      const matchesType = !this.requestFilters.requestType || request.TypeName === this.requestFilters.requestType;
      const matchesStatus = !this.requestFilters.status || request.Status === this.requestFilters.status;
      const matchesSearch = !this.requestFilters.search || 
        `${request.FirstName} ${request.LastName}`.toLowerCase().includes(this.requestFilters.search.toLowerCase());
      
      let matchesDate = true;
      if (this.requestFilters.dateRange) {
        const requestDate = new Date(request.RequestDate);
        const today = new Date();
        
        switch (this.requestFilters.dateRange) {
          case 'today':
            matchesDate = requestDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            matchesDate = requestDate >= weekStart;
            break;
          case 'month':
            matchesDate = requestDate.getMonth() === today.getMonth() && 
                         requestDate.getFullYear() === today.getFullYear();
            break;
        }
      }
      
      return matchesEmployee && matchesType && matchesStatus && matchesSearch && matchesDate;
    });
  }

  // Modal handlers for requests
  openApproveModal(request: any) {
    this.selectedRequest = request;
    this.showApproveModal = true;
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.selectedRequest = null;
  }

  openRejectModal(request: any) {
    this.selectedRequest = request;
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectReason = '';
  }

  openDeleteModal(record: any) {
    this.selectedRecord = record;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedRecord = null;
  }

  // Action methods for requests
  confirmApprove() {
    if (this.selectedRequest) {
      const approvedBy = this.authService.getUserId();
      if (approvedBy) {
        this.employeeService.approveAttendanceRequest({ 
          RequestID: this.selectedRequest.RequestID, 
          ApprovedBy: approvedBy, 
          Status: 'Approved' 
        }).subscribe({
          next: () => {
            this.closeApproveModal();
            this.loadAttendanceRequests();
          },
          error: (err) => {
            console.error('Error approving attendance request:', err);
            alert(err.error?.error || 'Failed to approve request');
          }
        });
      }
    }
  }

  confirmReject() {
    if (this.selectedRequest) {
      const approvedBy = this.authService.getUserId();
      if (approvedBy) {
        this.employeeService.approveAttendanceRequest({ 
          RequestID: this.selectedRequest.RequestID, 
          ApprovedBy: approvedBy, 
          Status: 'Rejected' 
        }).subscribe({
          next: () => {
            this.closeRejectModal();
            this.loadAttendanceRequests();
          },
          error: (err) => {
            console.error('Error rejecting attendance request:', err);
            alert(err.error?.error || 'Failed to reject request');
          }
        });
      }
    }
  }

  confirmDelete() {
    if (this.selectedRecord) {
      this.employeeService.cancelAttendanceRequest(this.selectedRecord.AttendanceID).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadAttendanceRecords();
        },
        error: (err) => {
          console.error('Error deleting attendance record:', err);
          alert(err.error?.error || 'Failed to delete attendance record');
        }
      });
    }
  }

  // Helper methods
  getAttendanceStatus(record: any): string {
    if (record.CheckInTime && !record.CheckOutTime) return 'Checked In';
    if (record.CheckInTime && record.CheckOutTime) return 'Checked Out';
    if (record.Status) return record.Status;
    return 'Absent';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Checked In': return 'bg-green-100 text-green-800';
      case 'Checked Out': return 'bg-blue-100 text-blue-800';
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  calculateWorkingHours(checkIn: string, checkOut: string): string {
    if (!checkIn || !checkOut) return 'N/A';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    return hours.toFixed(2) + ' hrs';
  }

  // Stats methods
  getTotalRecords(): number {
    return this.attendanceRecords.length;
  }

  getPresentTodayCount(): number {
    const today = new Date().toDateString();
    return this.attendanceRecords.filter(record => 
      record.CheckInTime && new Date(record.CheckInTime).toDateString() === today
    ).length;
  }

  getPendingRequestsCount(): number {
    return this.attendanceRequests.filter(request => request.Status === 'Pending').length;
  }

  getApprovedRequestsCount(): number {
    return this.attendanceRequests.filter(request => request.Status === 'Approved').length;
  }

  exportAttendance() {
    console.log('Exporting attendance data...');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}