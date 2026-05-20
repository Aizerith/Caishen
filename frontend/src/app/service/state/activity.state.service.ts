import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GroupHttpService } from '../http/group.http.service';
import { ProfileStateService } from './profile.state.service';
import GroupActivityResponse = CaiShen.GroupActivityResponse;

interface ActivityState {
  groupActivity: GroupActivityResponse[];
  readHistoryIds: Record<string, number>;
}

@Injectable({
  providedIn: 'root',
})
export class ActivityStateService {
  private readonly storageKey = 'caishen:read-group-activity';
  private readonly initialState: ActivityState = {
    groupActivity: [],
    readHistoryIds: this.loadReadHistoryIds(),
  };

  private readonly activityState: WritableSignal<ActivityState> = signal(this.initialState);
  readonly groupActivity: Signal<GroupActivityResponse[]> = computed(() => this.activityState().groupActivity);

  constructor(
    private groupHttpService: GroupHttpService,
    private profileStateService: ProfileStateService,
  ) {}

  refreshGroupActivityAction(): Observable<GroupActivityResponse[]> {
    return this.groupHttpService.getGroupActivity().pipe(
      tap((groupActivity) => {
        this.activityState.update((state) => ({
          ...state,
          groupActivity,
        }));
      }),
    );
  }

  latestActivityForGroup(groupId: number): GroupActivityResponse | null {
    return this.activityState().groupActivity.find((activity) => activity.groupId === groupId) ?? null;
  }

  hasUnreadActivity(groupId: number): boolean {
    const activity = this.latestActivityForGroup(groupId);
    if (!activity) {
      return false;
    }

    if (activity.actorId === this.profileStateService.profile()?.id) {
      return false;
    }

    return activity.latestHistoryId > (this.activityState().readHistoryIds[String(groupId)] ?? 0);
  }

  getReadHistoryId(groupId: number): number {
    return this.activityState().readHistoryIds[String(groupId)] ?? 0;
  }

  markGroupAsRead(groupId: number, latestHistoryId?: number): void {
    const activity = this.latestActivityForGroup(groupId);
    const historyIdToMark = latestHistoryId ?? activity?.latestHistoryId;
    if (!historyIdToMark) {
      return;
    }

    this.activityState.update((state) => {
      const currentReadHistoryId = state.readHistoryIds[String(groupId)] ?? 0;
      const readHistoryIds = {
        ...state.readHistoryIds,
        [String(groupId)]: Math.max(currentReadHistoryId, historyIdToMark),
      };
      this.saveReadHistoryIds(readHistoryIds);
      return {
        ...state,
        readHistoryIds,
      };
    });
  }

  private loadReadHistoryIds(): Record<string, number> {
    try {
      const value = localStorage.getItem(this.storageKey);
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  }

  private saveReadHistoryIds(readHistoryIds: Record<string, number>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(readHistoryIds));
    } catch {
      return;
    }
  }
}
