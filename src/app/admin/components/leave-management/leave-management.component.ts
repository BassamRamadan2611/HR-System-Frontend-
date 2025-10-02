import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html'
})
export class LeaveManagementComponent implements OnInit {
  leaves: any[] = [];
  filteredLeaves: any[] = [];
  leaveTypes: any[] = [];
  isSidebarOpen = true;
  
  // Modal states
  showApproveModal = false;
  showRejectModal = false;
  showDeleteModal = false;
  selectedLeave: any = null;
  rejectReason = '';

  // Filters
  filters = {
    status: '',
    leaveType: '',
    dateRange: '',
    search: ''
  };

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLeaves();
    this.loadLeaveTypes();
  }

  loadLeaves() {
    this.employeeService.getLeaves().subscribe(data => {
      this.leaves = data;
      this.applyFilters();
    });
  }

  loadLeaveTypes() {
    this.employeeService.getLeaveTypes().subscribe(data => {
      this.leaveTypes = data;
    });
  }

  // Filter methods
  applyFilters() {
    this.filteredLeaves = this.leaves.filter(leave => {
      const matchesStatus = !this.filters.status || leave.Status === this.filters.status;
      const matchesType = !this.filters.leaveType || leave.TypeName === this.filters.leaveType;
      const matchesSearch = !this.filters.search || 
        `${leave.FirstName} ${leave.LastName}`.toLowerCase().includes(this.filters.search.toLowerCase());
      
      let matchesDate = true;
      if (this.filters.dateRange) {
        const today = new Date();
        const startDate = new Date(leave.StartDate);
        
        switch (this.filters.dateRange) {
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
      
      return matchesStatus && matchesType && matchesSearch && matchesDate;
    });
  }

  // Modal handlers
  openApproveModal(leave: any) {
    this.selectedLeave = leave;
    this.showApproveModal = true;
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.selectedLeave = null;
  }

  openRejectModal(leave: any) {
    this.selectedLeave = leave;
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedLeave = null;
    this.rejectReason = '';
  }

  openDeleteModal(leave: any) {
    this.selectedLeave = leave;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedLeave = null;
  }

  // Action methods
  confirmApprove() {
    if (this.selectedLeave) {
      const approvedBy = this.authService.getUserId();
      console.log(approvedBy)
    
      if (approvedBy) {
            const data = {

          LeaveID: this.selectedLeave.LeaveID, 
          ApprovedBy: approvedBy, 
          Status: 'Approved' 
        
        }
        console.log(data)
      
        this.employeeService.approveLeave(data).subscribe({
          next: () => {
            this.closeApproveModal();
            this.loadLeaves();
          },
          error: (err) => {
            console.error('Error approving leave:', err);
            alert(err.error?.error || 'Failed to approve leave');
          }
        });
      }
    }
  }

  confirmReject() {
    if (this.selectedLeave) {
      const approvedBy = this.authService.getUserId();
      if (approvedBy) {
        this.employeeService.approveLeave({ 
          LeaveID: this.selectedLeave.LeaveID, 
          ApprovedBy: approvedBy, 
          Status: 'Rejected' 
        }).subscribe({
          next: () => {
            this.closeRejectModal();
            this.loadLeaves();
          },
          error: (err) => {
            console.error('Error rejecting leave:', err);
            alert(err.error?.error || 'Failed to reject leave');
          }
        });
      }
    }
  }

  confirmDelete() {
    if (this.selectedLeave) {
      this.employeeService.deleteLeave(this.selectedLeave.LeaveID).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadLeaves();
        },
        error: (err) => {
          console.error('Error deleting leave:', err);
          alert(err.error?.error || 'Failed to delete leave');
        }
      });
    }
  }



  exportLeaves() {
    // Implement export functionality
    console.log('Exporting leaves...');
  }

  // Helper methods
  getPendingLeavesCount(): number {
    return this.leaves.filter(leave => leave.Status === 'Pending').length;
  }

  getApprovedLeavesCount(): number {
    return this.leaves.filter(leave => leave.Status === 'Approved').length;
  }

  getRejectedLeavesCount(): number {
    return this.leaves.filter(leave => leave.Status === 'Rejected').length;
  }

 calculateLeaveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ensure end is after start
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return 0;
  }

  // Difference in milliseconds
  const diff = end.getTime() - start.getTime();

  // Convert to days (add 1 to include both start and end dates)
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
    logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}