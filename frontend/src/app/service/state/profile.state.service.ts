import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import UserGroupResponse = CaiShen.UserGroupResponse;
import { ProfileHttpService } from '../http/profile.http.service';
import ProfileInfoResponse = CaiShen.ProfileInfoResponse;

export interface ProfileStateInterface {
  info: ProfileInfoResponse | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  private readonly initialState: ProfileStateInterface = {
    info: null,
  };

  private profileState: WritableSignal<ProfileStateInterface> = signal(this.initialState);
  readonly profile: Signal<ProfileInfoResponse | null> = computed(() => this.profileState().info);
  readonly groups: Signal<UserGroupResponse[]> = computed(() => this.profileState().info?.userGroups ?? []);

  constructor(private profileHttpService: ProfileHttpService) {}

  private updateState(newState: ProfileStateInterface): void {
    this.profileState.set(newState);
  }

  public selectProfileState(): Signal<ProfileStateInterface> {
    return this.profileState.asReadonly();
  }

  public selectProfileGroups(): Signal<UserGroupResponse[]> {
    return this.groups;
  }

  public getMyId() {
    return this.profileState().info?.id ?? null;
  }

  public getProfileAction(): Observable<ProfileInfoResponse> {
    return this.profileHttpService.getProfileInfo().pipe(
      tap((value) => {
        this.updateState({
          info: value,
        });
      }),
    );
  }

  public updateGroup(data: UserGroupResponse) {
    const info = this.profileState().info;
    if (!info) {
      return;
    }

    this.updateState({
      info: {
        ...info,
        userGroups: [...info.userGroups, data],
      },
    });
  }

  public joinGroupAction(uuid: string): Observable<UserGroupResponse> {
    return this.profileHttpService.joinGroup(uuid).pipe(
      tap((value) => {
        const info = this.profileState().info;
        if (info && !info.userGroups.some((userGroup) => value.id === userGroup.id)) {
          this.updateState({
            info: {
              ...info,
              userGroups: [...info.userGroups, value],
            },
          });
        }
      }),
    );
  }
}
