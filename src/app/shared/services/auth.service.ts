import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { Username: string, Password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  register(user: { Username: string, Password: string, Role: string, EmployeeID: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/profile`, profileData);
  }

  changePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, passwordData);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.id || decoded.userId || decoded.sub;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getEmployeeId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.employeeId || decoded.employeeID;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin';
  }

  // NEW: Check if user is manager
  isManager(): boolean {
    const role = this.getUserRole();
    return role === 'manager';
  }

  // NEW: Check if user is regular employee/user
  isRegularUser(): boolean {
    const role = this.getUserRole();
    return role === 'user' || role === 'employee';
  }

  // NEW: Check if user has management privileges (admin or manager)
  hasManagementPrivileges(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'manager';
  }

  // NEW: Check if user can approve requests
  canApproveRequests(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'manager';
  }

// NEW: Get user's department ID (for managers) with fallback
getUserDepartment(): number | null {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      console.log('Token department data:', {
        departmentId: decoded.departmentId,
        departmentID: decoded.departmentID,
        DepartmentID: decoded.DepartmentID,
        employeeData: decoded
      });
      
      // Try different possible property names
      return decoded.departmentId || decoded.departmentID || decoded.DepartmentID || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
}

// NEW: Alternative method to get department from employee data
async getDepartmentFromEmployee(): Promise<number | null> {
  const employeeId = this.getEmployeeId();
  if (!employeeId) return null;

  try {
    // You'll need to inject EmployeeService or HttpClient here
    const response = await this.http.get<any>(`${this.apiUrl}/employees/${employeeId}`).toPromise();
    return response.DepartmentID || null;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return null;
  }
}

// NEW: Check if user has department access
hasDepartmentAccess(): boolean {
  return this.isManager() && !!this.getUserDepartment();
}

  // NEW: Get user permissions based on role
  getUserPermissions(): any {
  const role = this.getUserRole()  
    const permissions = {
      admin: {
        canViewAllEmployees: true,
        canManageEmployees: true,
        canManageDepartments: true,
        canApproveLeaves: true,
        canApproveAttendance: true,
        canManagePayroll: true,
        canManageReviews: true,
        canManageUsers: true,
        canViewReports: true,
        scope: 'all'
      },
      manager: {
        canViewAllEmployees: false,
        canManageEmployees: true,
        canManageDepartments: false,
        canApproveLeaves: true,
        canApproveAttendance: true,
        canManagePayroll: false,
        canManageReviews: true,
        canManageUsers: false,
        canViewReports: true,
        scope: 'department'
      },
      user: {
        canViewAllEmployees: false,
        canManageEmployees: false,
        canManageDepartments: false,
        canApproveLeaves: false,
        canApproveAttendance: false,
        canManagePayroll: false,
        canManageReviews: false,
        canManageUsers: false,
        canViewReports: false,
        scope: 'self'
      },
      employee: {
        canViewAllEmployees: false,
        canManageEmployees: false,
        canManageDepartments: false,
        canApproveLeaves: false,
        canApproveAttendance: false,
        canManagePayroll: false,
        canManageReviews: false,
        canManageUsers: false,
        canViewReports: false,
        scope: 'self'
      }
    };

  //  return permissions[role] || permissions.user ;
  }

  // NEW: Check if user can access specific employee data
  canAccessEmployee(employeeId: number): boolean {
    const userRole = this.getUserRole();
    const currentUserId = this.getEmployeeId();

    if (userRole === 'admin') {
      return true; // Admin can access all
    }

    if (userRole === 'manager') {
      // For now, return true - you'll implement department-based checks later
      return true;
    }

    // Regular users can only access their own data
    return employeeId === currentUserId;
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded.role || decoded.Role || decoded.roles || decoded.userRole;
        return role ? role.toLowerCase() : null;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getUserData(): any {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/users`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/auth/users/${userId}`);
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/users/${userId}`, userData);
  }

  logout() {
    localStorage.removeItem('token');
  }

  // Add this method to debug the token
  debugToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('=== TOKEN DEBUG INFO ===');
        console.log('Full token payload:', decoded);
        console.log('All keys in token:', Object.keys(decoded));
        console.log('Token expiration:', new Date(decoded.exp * 1000));
        console.log('========================');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('No token found in localStorage');
    }
  }
}