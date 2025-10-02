import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees`);
  }

  getEmployee(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employees/${id}`);
  }

  addEmployee(employee: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/employees`, employee);
  }

  updateEmployee(id: number, employee: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees/${id}`, employee);
  }
    deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}`);
  }

    /**
   * Get employees by department with optional manager filter
   * @param departmentId - Department ID
   * @param managerId - Optional manager ID to filter by
   */
  getEmployeesByDepartment(departmentId: number, managerId?: number): Observable<any> {
    let url = `${this.apiUrl}/employees/department/${departmentId}`;
    if (managerId) {
      url += `?managerId=${managerId}`;
    }
    return this.http.get<any>(url);
  }

  /**
   * Get employees by department and specific manager
   * @param departmentId - Department ID
   * @param managerId - Manager ID
   */
  getEmployeesByDepartmentAndManager(departmentId: number, managerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employees/department/${departmentId}/manager/${managerId}`);
  }

  /**
   * Get all managers in a specific department
   * @param departmentId - Department ID
   */
  getManagersInDepartment(departmentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employees/department/${departmentId}/managers`);
  }

  getAttendance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/attendance`);
  }

  checkIn(employeeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/checkin`, { EmployeeID: employeeId });
  }

  checkOut(attendanceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/checkout`, { AttendanceID: attendanceId });
  }

// Add these methods to your existing EmployeeService

// Get leaves for specific employee
getEmployeeLeaves(employeeId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/leaves?employeeId=${employeeId}`);
}

// Get specific leave by ID
getLeaveById(leaveId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/leaves/${leaveId}`);
}

// Update leave
updateLeave(leaveId: number, leaveData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/leaves/${leaveId}`, leaveData);
}

// Cancel leave
cancelLeave(leaveId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/leaves/${leaveId}`);
}

  getLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaves`);
  }

  requestLeave(leave: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leaves`, leave);
  }

  approveLeave(leave:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leaves/approve`, leave);
  }

  deleteLeave(leaveId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leaves/${leaveId}`);
  }

  getLeaveTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leave-types`);
  }

  addLeaveType(leaveType: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave-types`, leaveType);
  }

  updateLeaveType(leaveTypeId: number, leaveType: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/leave-types/${leaveTypeId}`, leaveType);
  }

  deleteLeaveType(leaveTypeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leave-types/${leaveTypeId}`);
  }

  getPayrolls(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payroll`);
  }

  generatePayroll(payroll: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payroll`, payroll);
  }

  deletePayroll(payrollId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payroll/${payrollId}`);
  }

  getReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/performance-reviews`);
  }

  addReview(review: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance-reviews`, review);
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/performance-reviews/${reviewId}`);
  }




   getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  addDepartment(department: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/departments`, department);
  }

  updateDepartment(departmentId: number, department: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/departments/${departmentId}`, department);
  }

  deleteDepartment(departmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/departments/${departmentId}`);
  }
// Add these methods to your existing EmployeeService

// Get attendance request types
getAttendanceRequestTypes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/attendance-requests/types`);
}

// Submit attendance request
submitAttendanceRequest(request: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/attendance-requests`, request);
}

// Get attendance requests for employee
getEmployeeAttendanceRequests(employeeId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/attendance-requests?employeeId=${employeeId}`);
}

// Update attendance request
updateAttendanceRequest(requestId: number, requestData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/attendance-requests/${requestId}`, requestData);
}

// Cancel attendance request
cancelAttendanceRequest(requestId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/attendance-requests/${requestId}`);
}
// Get all attendance requests (for admin)
getAttendanceRequests(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/attendance-requests`);
}

// Approve/reject attendance request
approveAttendanceRequest(approvalData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/attendance-requests/approve`, approvalData);
}

}