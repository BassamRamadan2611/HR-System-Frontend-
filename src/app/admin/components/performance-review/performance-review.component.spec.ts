import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceReviewComponent } from './performance-review.component';

describe('PerformanceReviewComponent', () => {
  let component: PerformanceReviewComponent;
  let fixture: ComponentFixture<PerformanceReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerformanceReviewComponent]
    });
    fixture = TestBed.createComponent(PerformanceReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
