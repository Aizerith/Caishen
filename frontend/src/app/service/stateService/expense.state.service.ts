import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GroupHttpService } from '../httpService/group.http.service';
import ExpenseInfoResponse = CaiShen.ExpenseInfoResponse;

export interface ExpenseStateInterface {
  expenseInfo: ExpenseInfoResponse | null;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseStateService {
  readonly groupHttpService: GroupHttpService = inject(GroupHttpService);

  private state: ExpenseStateInterface = {
    expenseInfo: null,
  };
  private expenseState: WritableSignal<ExpenseStateInterface> = signal(this.state);

  private updateState(newState: ExpenseStateInterface): void {
    this.state = newState;
    this.expenseState.set({ ...this.state });
  }

  public selectExpenseInfo(): Signal<ExpenseInfoResponse | null> {
    return computed(() => this.expenseState().expenseInfo);
  }

  public getExpenseInfoAction(id: number): Observable<ExpenseInfoResponse> {
    return this.groupHttpService.getExpenseInfoById(id).pipe(
      tap((value) => {
        const newState: ExpenseStateInterface = {
          expenseInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }
}
