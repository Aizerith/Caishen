import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import UserGroupResponse = CaiShen.UserGroupResponse;
import { ProfileHttpService } from '../httpService/profile.http.service';
import ProfileInfoResponse = CaiShen.ProfileInfoResponse;

export interface ProfileStateInterface {
  info: ProfileInfoResponse | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  private state: ProfileStateInterface = {
    info: null,
  };

  private profileStateSubject: BehaviorSubject<ProfileStateInterface> = new BehaviorSubject<ProfileStateInterface>(
    this.state,
  );

  constructor(private profileHttpService: ProfileHttpService) {}

  private updateState(newState: ProfileStateInterface): void {
    this.state = newState;
    this.profileStateSubject.next(this.state);
  }

  public selectProfileState(): Observable<ProfileStateInterface> {
    return this.profileStateSubject.asObservable();
  }

  public selectProfileGroups(): Observable<UserGroupResponse[] | null> {
    return this.profileStateSubject.asObservable().pipe(map((value) => value.info?.userGroups ?? null));
  }

  public getMyId() {
    return this.state.info!.id;
  }

  public getProfileAction(): Observable<ProfileInfoResponse> {
    return this.profileHttpService.getProfileInfo().pipe(
      tap((value) => {
        this.state = {
          info: value,
        };
        this.updateState(this.state);
      }),
    );
  }

  public updateGroup(data: UserGroupResponse) {
    this.state.info?.userGroups.push(data);
    this.updateState(this.state);
  }

  public joinGroupAction(uuid: string): Observable<UserGroupResponse> {
    return this.profileHttpService.joinGroup(uuid).pipe(
      tap((value) => {
        if (!this.state.info?.userGroups.some((userGroup) => value.id === userGroup.id)) {
          this.state.info?.userGroups.push(value);
          const newState: ProfileStateInterface = {
            ...this.state,
          };
          this.updateState(newState);
        }
      }),
    );
  }
}
