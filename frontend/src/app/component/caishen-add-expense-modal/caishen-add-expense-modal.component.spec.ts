import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { CaishenAddExpenseModalComponent } from './caishen-add-expense-modal.component';
import { translocoTestingModule } from '../../testing/transloco-testing';

describe('CaishenAddExpenseModalComponent', () => {
  let component: CaishenAddExpenseModalComponent;
  let fixture: ComponentFixture<CaishenAddExpenseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaishenAddExpenseModalComponent, translocoTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaishenAddExpenseModalComponent);
    component = fixture.componentInstance;
    component.expenseForm = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      amount: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      payerId: new FormControl<number | undefined>(undefined, { validators: [Validators.required] }),
      expenseDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      participants: new FormArray<FormControl<string>>([]),
    });
    component.memberList = [
      { id: 1, name: 'Shen', expenseDelta: 0 },
    ] as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
