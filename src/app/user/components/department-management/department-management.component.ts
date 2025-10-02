import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent implements OnInit {
  // Team management properties
  employees: any[] = [];
  managers: any[] = [];
  selectedManager: any = null;
  isLoading = false;
  user: any = {};
  department: any = {};
  hasAccess = false;
  errorMessage = '';
  isSidebarOpen = true;
  
  // Team filter options
  searchTerm = '';
  statusFilter = 'all';
  jobTitleFilter = '';

  // Attendance management properties
  teamAttendanceRecords: any[] = [];
  teamAttendanceRequests: any[] = [];
  filteredAttendance: any[] = [];
  filteredRequests: any[] = [];
  attendanceRequestTypes: any[] = [];
  
  // Leave management properties
  teamLeaves: any[] = [];
  filteredLeaves: any[] = [];
  leaveTypes: any[] = [];
  
  // Active tab
  activeTab: 'team' | 'attendance' | 'requests' | 'leaves' = 'team';
  
  // Modal states for attendance
  showApproveModal = false;
  showRejectModal = false;
  selectedRequest: any = null;
  rejectReason = '';

  // Modal states for leaves
  showApproveLeaveModal = false;
  showRejectLeaveModal = false;
  showDeleteLeaveModal = false;
  selectedLeave: any = null;
  leaveRejectReason = '';

  // Filters for attendance records
  recordFilters = {
    employee: '',
    dateRange: '',
    status: '',
    search: ''
  };

  // Filters for attendance requests
  requestFilters = {
    employee: '',
    requestType: '',
    status: '',
    dateRange: '',
    search: ''
  };

  // Filters for leaves
  leaveFilters = {
    employee: '',
    leaveType: '',
    status: '',
    dateRange: '',
    search: ''
  };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadDepartmentData();
  }

  async loadDepartmentData() {
    // Check if user is a manager first
    if (!this.authService.isManager()) {
      this.errorMessage = 'Access denied. Manager privileges required.';
      this.hasAccess = false;
      return;
    }

    this.isLoading = true;
    const employeeId = this.authService.getEmployeeId();
    
    if (!employeeId) {
      this.errorMessage = 'Unable to identify employee. Please log in again.';
      this.isLoading = false;
      return;
    }

    try {
      // Load manager's information first to get department
      const userData = await this.employeeService.getEmployee(employeeId).toPromise();
      this.user = userData;
      
      // Get department ID from user data if not in token
      const departmentId = this.authService.getUserDepartment() || userData.DepartmentID;
      
      if (!departmentId) {
        this.errorMessage = 'Department information not found. Please contact administrator.';
        this.hasAccess = false;
        this.isLoading = false;
        return;
      }

      this.department = {
        id: departmentId,
        name: userData.DepartmentName || `Department ${departmentId}`
      };

      this.hasAccess = true;
      
      // Load managers and team data
      await this.loadManagersAndTeam(departmentId, employeeId);
      
    } catch (error) {
      console.error('Error loading department data:', error);
      this.errorMessage = 'Failed to load department information. Please try again.';
      this.hasAccess = false;
    } finally {
      this.isLoading = false;
    }
  }

  async loadManagersAndTeam(departmentId: number, employeeId: number) {
    try {
      // Load all managers in the department
      const managersResponse = await this.employeeService.getManagersInDepartment(departmentId).toPromise();
      this.managers = managersResponse.managers || [];
      this.department = managersResponse.department || this.department;
      
      // Auto-select the current manager if available
      const currentManager = this.managers.find(m => m.EmployeeID === employeeId);
      if (currentManager) {
        this.selectedManager = currentManager;
        await this.loadTeamData(departmentId, currentManager.EmployeeID);
      } else if (this.managers.length > 0) {
        // Select first manager by default
        this.selectedManager = this.managers[0];
        await this.loadTeamData(departmentId, this.managers[0].EmployeeID);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
      this.errorMessage = 'Failed to load managers information.';
    }
  }

  async loadTeamData(departmentId: number, managerId: number) {
    this.isLoading = true;
    try {
      // Load team employees
      const teamResponse = await this.employeeService.getEmployeesByDepartmentAndManager(departmentId, managerId).toPromise();
      this.employees = teamResponse.employees || [];
      
      // Load attendance data for the team
      await this.loadTeamAttendanceData();
      
      // Load attendance request types
      await this.loadAttendanceRequestTypes();
      
      // Load leave data for the team
      await this.loadTeamLeavesData();
      
      // Load leave types
      await this.loadLeaveTypes();
      
    } catch (error) {
      console.error('Error loading team data:', error);
      this.employees = [];
      this.errorMessage = 'Failed to load team data.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadTeamAttendanceData() {
    try {
      // Load all attendance records and filter for team members
      const allAttendance = await this.employeeService.getAttendance().toPromise();
      const teamEmployeeIds = this.employees.map(emp => emp.EmployeeID);
      this.teamAttendanceRecords = Array.isArray(allAttendance) 
        ? allAttendance.filter(att => teamEmployeeIds.includes(att.EmployeeID))
        : [];
      this.applyRecordFilters();

      // Load all attendance requests and filter for team members
      const allRequests = await this.employeeService.getAttendanceRequests().toPromise();
      this.teamAttendanceRequests = Array.isArray(allRequests)
        ? allRequests.filter(req => teamEmployeeIds.includes(req.EmployeeID))
        : [];
      this.applyRequestFilters();

    } catch (error) {
      console.error('Error loading attendance data:', error);
      this.teamAttendanceRecords = [];
      this.teamAttendanceRequests = [];
    }
  }

  async loadTeamLeavesData() {
    try {
      // Load all leaves and filter for team members
      const allLeaves = await this.employeeService.getLeaves().toPromise();
      const teamEmployeeIds = this.employees.map(emp => emp.EmployeeID);
      this.teamLeaves = Array.isArray(allLeaves)
        ? allLeaves.filter(leave => teamEmployeeIds.includes(leave.EmployeeID))
        : [];
      this.applyLeaveFilters();
    } catch (error) {
      console.error('Error loading leave data:', error);
      this.teamLeaves = [];
    }
  }

  async loadAttendanceRequestTypes() {
    try {
      const types = await this.employeeService.getAttendanceRequestTypes().toPromise();
      this.attendanceRequestTypes = types || [];
    } catch (error) {
      console.error('Error loading attendance request types:', error);
      this.attendanceRequestTypes = [];
    }
  }

  async loadLeaveTypes() {
    try {
      const types = await this.employeeService.getLeaveTypes().toPromise();
      this.leaveTypes = types || [];
    } catch (error) {
      console.error('Error loading leave types:', error);
      this.leaveTypes = [];
    }
  }

  onManagerChange(manager: any) {
    this.selectedManager = manager;
    const departmentId = this.department.id;
    if (departmentId) {
      this.loadTeamData(departmentId, manager.EmployeeID);
    }
  }

  // Tab management
  setActiveTab(tab: 'team' | 'attendance' | 'requests' | 'leaves') {
    this.activeTab = tab;
  }

  // Sidebar methods
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ========== TEAM MANAGEMENT METHODS ==========
  get filteredEmployees() {
    return this.employees.filter(employee => {
      const matchesSearch = !this.searchTerm || 
        employee.FirstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.LastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.Email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.JobTitle.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || 
        employee.Status.toLowerCase() === this.statusFilter.toLowerCase();

      const matchesJobTitle = !this.jobTitleFilter ||
        employee.JobTitle.toLowerCase().includes(this.jobTitleFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesJobTitle;
    });
  }

  get jobTitles(): string[] {
    const titles = [...new Set(this.employees.map(emp => emp.JobTitle))];
    return titles.filter(title => title).sort();
  }

  // Get employee statistics
  get employeeStats() {
    const total = this.employees.length;
    const active = this.employees.filter(emp => emp.Status === 'Active').length;
    const inactive = this.employees.filter(emp => emp.Status === 'Inactive').length;
    const onLeave = this.employees.filter(emp => emp.Status === 'On Leave').length;

    return { total, active, inactive, onLeave };
  }

  // Method to get employee name by ID
  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.EmployeeID === employeeId);
    return employee ? `${employee.FirstName} ${employee.LastName}` : 'Unknown';
  }

  // Method to get employee job title by ID
  getEmployeeJobTitle(employeeId: number): string {
    const employee = this.employees.find(emp => emp.EmployeeID === employeeId);
    return employee ? employee.JobTitle : 'Unknown';
  }

  // Method to get employee initials by ID
  getEmployeeInitials(employeeId: number): string {
    const employee = this.employees.find(emp => emp.EmployeeID === employeeId);
    if (!employee) return '??';
    return `${employee.FirstName?.charAt(0) || ''}${employee.LastName?.charAt(0) || ''}`;
  }

  // Method to enhance attendance records with employee data
  getEnhancedAttendanceRecords() {
    return this.filteredAttendance.map(record => ({
      ...record,
      employeeName: this.getEmployeeName(record.EmployeeID),
      jobTitle: this.getEmployeeJobTitle(record.EmployeeID),
      initials: this.getEmployeeInitials(record.EmployeeID)
    }));
  }

  // Method to enhance attendance requests with employee data
  getEnhancedAttendanceRequests() {
    return this.filteredRequests.map(request => ({
      ...request,
      employeeName: this.getEmployeeName(request.EmployeeID),
      jobTitle: this.getEmployeeJobTitle(request.EmployeeID),
      initials: this.getEmployeeInitials(request.EmployeeID)
    }));
  }

  // Method to enhance leaves with employee data
  getEnhancedLeaves() {
    return this.filteredLeaves.map(leave => ({
      ...leave,
      employeeName: this.getEmployeeName(leave.EmployeeID),
      jobTitle: this.getEmployeeJobTitle(leave.EmployeeID),
      initials: this.getEmployeeInitials(leave.EmployeeID)
    }));
  }

  // ========== ATTENDANCE MANAGEMENT METHODS ==========
  // Filter methods for records
  applyRecordFilters() {
    this.filteredAttendance = this.teamAttendanceRecords.filter(record => {
      const employee = this.employees.find(emp => emp.EmployeeID === record.EmployeeID);
      const matchesEmployee = !this.recordFilters.employee || record.EmployeeID == this.recordFilters.employee;
      const matchesStatus = !this.recordFilters.status || this.getAttendanceStatus(record) === this.recordFilters.status;
      const matchesSearch = !this.recordFilters.search || 
        (employee && `${employee.FirstName} ${employee.LastName}`.toLowerCase().includes(this.recordFilters.search.toLowerCase()));
      
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
    this.filteredRequests = this.teamAttendanceRequests.filter(request => {
      const employee = this.employees.find(emp => emp.EmployeeID === request.EmployeeID);
      const matchesEmployee = !this.requestFilters.employee || request.EmployeeID == this.requestFilters.employee;
      const matchesType = !this.requestFilters.requestType || request.TypeName === this.requestFilters.requestType;
      const matchesStatus = !this.requestFilters.status || request.Status === this.requestFilters.status;
      const matchesSearch = !this.requestFilters.search || 
        (employee && `${employee.FirstName} ${employee.LastName}`.toLowerCase().includes(this.requestFilters.search.toLowerCase()));
      
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

  // ========== LEAVE MANAGEMENT METHODS ==========
  applyLeaveFilters() {
    this.filteredLeaves = this.teamLeaves.filter(leave => {
      const employee = this.employees.find(emp => emp.EmployeeID === leave.EmployeeID);
      const matchesEmployee = !this.leaveFilters.employee || leave.EmployeeID == this.leaveFilters.employee;
      const matchesType = !this.leaveFilters.leaveType || leave.TypeName === this.leaveFilters.leaveType;
      const matchesStatus = !this.leaveFilters.status || leave.Status === this.leaveFilters.status;
      const matchesSearch = !this.leaveFilters.search || 
        (employee && `${employee.FirstName} ${employee.LastName}`.toLowerCase().includes(this.leaveFilters.search.toLowerCase()));
      
      let matchesDate = true;
      if (this.leaveFilters.dateRange) {
        const startDate = new Date(leave.StartDate);
        const today = new Date();
        
        switch (this.leaveFilters.dateRange) {
          case 'today':
            matchesDate = startDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            matchesDate = startDate >= weekStart;
            break;
          case 'month':
            matchesDate = startDate.getMonth() === today.getMonth() && 
                         startDate.getFullYear() === today.getFullYear();
            break;
        }
      }
      
      return matchesEmployee && matchesType && matchesStatus && matchesSearch && matchesDate;
    });
  }

  // Modal handlers for attendance requests
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

  // Modal handlers for leaves
  openApproveLeaveModal(leave: any) {
    this.selectedLeave = leave;
    this.showApproveLeaveModal = true;
  }

  closeApproveLeaveModal() {
    this.showApproveLeaveModal = false;
    this.selectedLeave = null;
  }

  openRejectLeaveModal(leave: any) {
    this.selectedLeave = leave;
    this.showRejectLeaveModal = true;
  }

  closeRejectLeaveModal() {
    this.showRejectLeaveModal = false;
    this.selectedLeave = null;
    this.leaveRejectReason = '';
  }

  openDeleteLeaveModal(leave: any) {
    this.selectedLeave = leave;
    this.showDeleteLeaveModal = true;
  }

  closeDeleteLeaveModal() {
    this.showDeleteLeaveModal = false;
    this.selectedLeave = null;
  }

  // Action methods for attendance requests
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
            this.loadTeamAttendanceData();
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
            this.loadTeamAttendanceData();
          },
          error: (err) => {
            console.error('Error rejecting attendance request:', err);
            alert(err.error?.error || 'Failed to reject request');
          }
        });
      }
    }
  }

  // Action methods for leaves
  confirmApproveLeave() {
    if (this.selectedLeave) {
      const approvedBy = this.authService.getUserId();
      if (approvedBy) {
        const data = {
          LeaveID: this.selectedLeave.LeaveID, 
          ApprovedBy: approvedBy, 
          Status: 'Approved' 
        };
        
        this.employeeService.approveLeave(data).subscribe({
          next: () => {
            this.closeApproveLeaveModal();
            this.loadTeamLeavesData();
          },
          error: (err) => {
            console.error('Error approving leave:', err);
            alert(err.error?.error || 'Failed to approve leave');
          }
        });
      }
    }
  }

  confirmRejectLeave() {
    if (this.selectedLeave) {
      const approvedBy = this.authService.getUserId();
      if (approvedBy) {
        this.employeeService.approveLeave({ 
          LeaveID: this.selectedLeave.LeaveID, 
          ApprovedBy: approvedBy, 
          Status: 'Rejected' 
        }).subscribe({
          next: () => {
            this.closeRejectLeaveModal();
            this.loadTeamLeavesData();
          },
          error: (err) => {
            console.error('Error rejecting leave:', err);
            alert(err.error?.error || 'Failed to reject leave');
          }
        });
      }
    }
  }

  confirmDeleteLeave() {
    if (this.selectedLeave) {
      this.employeeService.deleteLeave(this.selectedLeave.LeaveID).subscribe({
        next: () => {
          this.closeDeleteLeaveModal();
          this.loadTeamLeavesData();
        },
        error: (err) => {
          console.error('Error deleting leave:', err);
          alert(err.error?.error || 'Failed to delete leave');
        }
      });
    }
  }

  // ========== HELPER METHODS ==========
  // UI helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAttendanceStatusColor(status: string): string {
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

  getLeaveStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAttendanceStatus(record: any): string {
    if (record.CheckInTime && !record.CheckOutTime) return 'Checked In';
    if (record.CheckInTime && record.CheckOutTime) return 'Checked Out';
    if (record.Status) return record.Status;
    return 'Absent';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateYearsOfService(hireDate: string): number {
    if (!hireDate) return 0;
    const hire = new Date(hireDate);
    const today = new Date();
    const years = today.getFullYear() - hire.getFullYear();
    return Math.max(0, years);
  }

  calculateWorkingHours(checkIn: string, checkOut: string): string {
    if (!checkIn || !checkOut) return 'N/A';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    return hours.toFixed(2) + ' hrs';
  }

  calculateLeaveDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }

    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  // Stats methods for attendance
  getTotalRecords(): number {
    return this.teamAttendanceRecords.length;
  }

  getPresentTodayCount(): number {
    const today = new Date().toDateString();
    return this.teamAttendanceRecords.filter(record => 
      record.CheckInTime && new Date(record.CheckInTime).toDateString() === today
    ).length;
  }

  getPendingRequestsCount(): number {
    return this.teamAttendanceRequests.filter(request => request.Status === 'Pending').length;
  }

  getApprovedRequestsCount(): number {
    return this.teamAttendanceRequests.filter(request => request.Status === 'Approved').length;
  }

  // Stats methods for leaves
  getPendingLeavesCount(): number {
    return this.teamLeaves.filter(leave => leave.Status === 'Pending').length;
  }

  getApprovedLeavesCount(): number {
    return this.teamLeaves.filter(leave => leave.Status === 'Approved').length;
  }

  getRejectedLeavesCount(): number {
    return this.teamLeaves.filter(leave => leave.Status === 'Rejected').length;
  }

  // Export methods
  exportTeamData() {
    const csvContent = this.convertToCSV(this.filteredEmployees);
    this.downloadCSV(csvContent, `team-${this.selectedManager?.LastName}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportAttendanceData() {
    const csvContent = this.convertAttendanceToCSV(this.filteredAttendance);
    this.downloadCSV(csvContent, `attendance-${this.selectedManager?.LastName}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportLeavesData() {
    const csvContent = this.convertLeavesToCSV(this.filteredLeaves);
    this.downloadCSV(csvContent, `leaves-${this.selectedManager?.LastName}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  private convertToCSV(data: any[]): string {
    const headers = ['Name', 'Email', 'Job Title', 'Status', 'Hire Date', 'Years of Service', 'Phone'];
    const rows = data.map(emp => [
      `${emp.FirstName} ${emp.LastName}`,
      emp.Email,
      emp.JobTitle,
      emp.Status,
      this.formatDate(emp.HireDate),
      this.calculateYearsOfService(emp.HireDate),
      emp.Phone || 'N/A'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertAttendanceToCSV(data: any[]): string {
    const headers = ['Employee Name', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status'];
    const rows = data.map(record => {
      const employee = this.employees.find(emp => emp.EmployeeID === record.EmployeeID);
      const employeeName = employee ? `${employee.FirstName} ${employee.LastName}` : 'Unknown';
      
      return [
        employeeName,
        this.formatDate(record.Date || record.CheckInTime),
        record.CheckInTime ? new Date(record.CheckInTime).toLocaleTimeString() : 'N/A',
        record.CheckOutTime ? new Date(record.CheckOutTime).toLocaleTimeString() : 'N/A',
        this.calculateWorkingHours(record.CheckInTime, record.CheckOutTime),
        this.getAttendanceStatus(record)
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertLeavesToCSV(data: any[]): string {
    const headers = ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Duration', 'Status', 'Reason'];
    const rows = data.map(leave => {
      const employee = this.employees.find(emp => emp.EmployeeID === leave.EmployeeID);
      const employeeName = employee ? `${employee.FirstName} ${employee.LastName}` : 'Unknown';
      
      return [
        employeeName,
        leave.TypeName,
        this.formatDate(leave.StartDate),
        this.formatDate(leave.EndDate),
        `${this.calculateLeaveDays(leave.StartDate, leave.EndDate)} days`,
        leave.Status,
        leave.Reason || 'No reason provided'
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}