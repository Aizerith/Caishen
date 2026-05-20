import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import GroupResponse = CaiShen.GroupResponse;
import { GroupHttpService } from '../http/group.http.service';
import ExpenseRequest = CaiShen.ExpenseRequest;
import { ProfileStateService } from './profile.state.service';
import ExpenseHistoryResponse = CaiShen.ExpenseHistoryResponse;
import SettlementPaymentRequest = CaiShen.SettlementPaymentRequest;

export interface GroupStateInterface {
  groupInfo: GroupResponse | null;
  expenseHistory: ExpenseHistoryResponse[];
  hasError: Boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GroupStateService {
  private readonly initialState: GroupStateInterface = {
    groupInfo: null,
    expenseHistory: [],
    hasError: false,
  };

  private groupState: WritableSignal<GroupStateInterface> = signal(this.initialState);
  readonly groupInfo: Signal<GroupResponse | null> = computed(() => this.groupState().groupInfo);
  readonly expenseHistory: Signal<ExpenseHistoryResponse[]> = computed(() => this.groupState().expenseHistory);
  readonly myBalance: Signal<number> = computed(() => {
    const memberList = this.groupState().groupInfo?.memberList;
    const myId = this.profileStateService.profile()?.id;

    const me = memberList?.find((member) => member.id === myId);
    return me?.expenseDelta ?? 0;
  });

  constructor(
    private groupHttpService: GroupHttpService,
    private profileStateService: ProfileStateService,
  ) {}

  private updateState(newState: GroupStateInterface): void {
    this.groupState.set(newState);
  }

  public selectGroupInfo(): Signal<GroupResponse | null> {
    return this.groupInfo;
  }

  public selectMyBalance(): Signal<number> {
    return this.myBalance;
  }

  public selectExpenseHistory(): Signal<ExpenseHistoryResponse[]> {
    return this.expenseHistory;
  }

  public getGroupInfoAction(id: number): Observable<GroupResponse> {
    return this.groupHttpService.getGroupInfo(id).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }

  public addExpense(data: ExpenseRequest) {
    return this.groupHttpService.addExpense(data).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }

  public updateExpense(id: number, data: ExpenseRequest) {
    return this.groupHttpService.updateExpense(id, data).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }

  public deleteExpense(id: number) {
    return this.groupHttpService.deleteExpense(id).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }

  public paySettlement(data: SettlementPaymentRequest) {
    return this.groupHttpService.paySettlement(data).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }

  public cancelSettlementPayment(paymentId: number) {
    return this.groupHttpService.cancelSettlementPayment(paymentId).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }

  public getGroupExpenseHistoryAction(groupId: number): Observable<ExpenseHistoryResponse[]> {
    return this.groupHttpService.getGroupExpenseHistory(groupId).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.groupState(),
          expenseHistory: value,
        };
        this.updateState(newState);
      }),
    );
  }
}
