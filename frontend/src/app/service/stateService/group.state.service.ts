import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
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
  private state: GroupStateInterface = {
    groupInfo: null,
    hasError: false,
  };

  private groupStateSubject: BehaviorSubject<GroupStateInterface> = new BehaviorSubject<GroupStateInterface>(
    this.state,
  );

  constructor(
    private groupHttpService: GroupHttpService,
    private profileStateService: ProfileStateService,
  ) {}

  private updateState(newState: GroupStateInterface): void {
    this.state = newState;
    this.groupStateSubject.next(this.state);
  }

  public selectGroupInfo(): Observable<GroupResponse> {
    return this.groupStateSubject.asObservable().pipe(map((value) => value.groupInfo!));
  }

  public selectMyBalance(): Observable<number> {
    return this.groupStateSubject.asObservable().pipe(
      map((state) => {
        const memberList = state.groupInfo?.memberList;
        const myId = this.profileStateService.getMyId();

        const me = memberList?.find((member) => member.id === myId);
        return me?.expenseDelta ?? 0;
      }),
    );
  }

  public getGroupInfoAction(id: number): Observable<GroupResponse> {
    return this.groupHttpService.getGroupInfo(id).pipe(
      tap((value) => {
        const newState: GroupStateInterface = {
          ...this.state,
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
          ...this.state,
          groupInfo: value,
        };
        this.updateState(newState);
      }),
    );
  }
}
