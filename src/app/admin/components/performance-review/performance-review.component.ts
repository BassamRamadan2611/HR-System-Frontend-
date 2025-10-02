import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/shared/services/employee.service';


@Component({
  selector: 'app-performance-review',
  templateUrl: './performance-review.component.html'
})
export class PerformanceReviewComponent implements OnInit {
  employees: any[] = [];
  reviews: any[] = [];
  newReview = {
    EmployeeID: null,
    ReviewerID: null,
    ReviewDate: '',
    Score: null,
    Comments: ''
  };

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.employeeService.getEmployees().subscribe(data => this.employees = data);
    this.employeeService.getReviews().subscribe(data => this.reviews = data);
  }

  addReview() {
    this.employeeService.addReview(this.newReview).subscribe({
      next: () => {
        alert('Review added successfully');
        this.newReview = { EmployeeID: null, ReviewerID: null, ReviewDate: '', Score: null, Comments: '' };
        this.ngOnInit();
      },
      error: (err) => alert(err.error.error)
    });
  }

  deleteReview(reviewId: number) {
    this.employeeService.deleteReview(reviewId).subscribe({
      next: () => {
        alert('Review deleted successfully');
        this.ngOnInit();
      },
      error: (err) => alert(err.error.error)
    });
  }
}