import { Component, Signal } from '@angular/core';
import { Router } from '@angular/router';
import UserGroupResponse = CaiShen.UserGroupResponse;
import { ProfileStateService } from '../../../service/state/profile.state.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivityStateService } from '../../../service/state/activity.state.service';
import GroupActivityResponse = CaiShen.GroupActivityResponse;

@Component({
  selector: 'app-group-list',
  imports: [TranslocoPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class GroupListComponent {
  readonly groups: Signal<UserGroupResponse[]>;

  constructor(
    private router: Router,
    private profileStateService: ProfileStateService,
    private activityStateService: ActivityStateService,
  ) {
    this.groups = this.profileStateService.selectProfileGroups();
  }

  latestActivityForGroup(groupId: number): GroupActivityResponse | null {
    return this.activityStateService.latestActivityForGroup(groupId);
  }

  hasUnreadActivity(groupId: number): boolean {
    return this.activityStateService.hasUnreadActivity(groupId);
  }

  getActivityTranslationKey(action: CaiShen.ExpenseHistoryAction) {
    return `expense.historyActions.${action}`;
  }

  navigateToCreateGroup() {
    this.router.navigate(['group', 'create']).then();
  }

  navigateToGroupId(id: number) {
    this.router.navigate(['group', id]).then();
  }
}
