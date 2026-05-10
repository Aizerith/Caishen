import { Component } from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import { Router } from '@angular/router';
import {Observable} from 'rxjs';
import UserGroupResponse = CaiShen.UserGroupResponse;
import {ProfileStateService} from '../../service/stateService/profile.state.service';

@Component({
  selector: 'app-home',
  imports: [NgForOf, NgIf, AsyncPipe],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css',
})
export class GroupComponent {
  groups$: Observable<UserGroupResponse[] | null> = new Observable();

  constructor(
    private router: Router,
    private profileStateService: ProfileStateService,
  ) {
    this.groups$ = this.profileStateService.selectProfileGroups();
  }

  navigateToAddGroup() {
    this.router.navigate(['group', 'add']).then();
  }

  navigateToGroupId(id: number) {
    this.router.navigate(['group', id]).then();
  }
}
