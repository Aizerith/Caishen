import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import GroupResponse = CaiShen.GroupResponse;
import { GroupHttpService } from '../httpService/group.http.service';
import ExpenseRequest = CaiShen.ExpenseRequest;
import { ProfileStateService } from './profile.state.service';

export interface GroupStateInterface {
  groupInfo: GroupResponse | null;
  hasError: Boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GroupStateService {
  private readonly initialState: GroupStateInterface = {
    groupInfo: null,
    hasError: false,
  };

  private groupState: WritableSignal<GroupStateInterface> = signal(this.initialState);
  readonly groupInfo: Signal<GroupResponse | null> = computed(() => this.groupState().groupInfo);
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
}
