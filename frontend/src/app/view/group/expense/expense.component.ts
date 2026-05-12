import {Component, inject, Signal} from '@angular/core';
import { DatePipe } from '@angular/common';
import { take } from 'rxjs';
import { ExpenseStateService } from '../../../service/stateService/expense.state.service';
import ExpenseInfoResponse = CaiShen.ExpenseInfoResponse;
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-expense',
  imports: [DatePipe],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  readonly expenseStateService: ExpenseStateService = inject(ExpenseStateService)
  readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute)

  protected expenseInfo: Signal<ExpenseInfoResponse | null> = this.expenseStateService.selectExpenseInfo();

  constructor(
  ) {
    this.expenseStateService.getExpenseInfoAction(this.activatedRoute.snapshot.params['id']).pipe(take(1)).subscribe();
  }
}
