import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-payroll-management',
  templateUrl: './payroll-management.component.html'
})
export class PayrollManagementComponent implements OnInit {
  employees: any[] = [];
  payrolls: any[] = [];
  newPayroll = {
    EmployeeID: null,
    Month: null,
    Year: new Date().getFullYear(),
    BasicSalary: null,
    Deductions: 0,
    Allowances: 0
  };
  currentYear = new Date().getFullYear();

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.employeeService.getEmployees().subscribe(data => this.employees = data);
    this.employeeService.getPayrolls().subscribe(data => this.payrolls = data);
  }

  generatePayroll() {
    this.employeeService.generatePayroll(this.newPayroll).subscribe({
      next: () => {
        alert('Payroll generated successfully');
        this.newPayroll = { EmployeeID: null, Month: null, Year: this.currentYear, BasicSalary: null, Deductions: 0, Allowances: 0 };
        this.ngOnInit();
      },
      error: (err) => alert(err.error.error)
    });
  }

  deletePayroll(payrollId: number) {
    this.employeeService.deletePayroll(payrollId).subscribe({
      next: () => {
        alert('Payroll deleted successfully');
        this.ngOnInit();
      },
      error: (err) => alert(err.error.error)
    });
  }
}