import { Component, Signal } from '@angular/core';
import { Router } from '@angular/router';
import UserGroupResponse = CaiShen.UserGroupResponse;
import {ProfileStateService} from '../../service/stateService/profile.state.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  imports: [TranslocoPipe],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css',
})
export class GroupComponent {
  readonly groups: Signal<UserGroupResponse[]>;

  constructor(
    private router: Router,
    private profileStateService: ProfileStateService,
  ) {
    this.groups = this.profileStateService.selectProfileGroups();
  }

  navigateToAddGroup() {
    this.router.navigate(['group', 'add']).then();
  }

  navigateToGroupId(id: number) {
    this.router.navigate(['group', id]).then();
  }
}
