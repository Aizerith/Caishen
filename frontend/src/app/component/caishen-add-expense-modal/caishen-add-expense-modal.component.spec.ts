import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaishenAddExpenseModalComponent } from './caishen-add-expense-modal.component';

describe('CaishenAddExpenseModalComponent', () => {
  let component: CaishenAddExpenseModalComponent;
  let fixture: ComponentFixture<CaishenAddExpenseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaishenAddExpenseModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaishenAddExpenseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
