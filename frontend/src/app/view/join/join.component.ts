import {Component, inject, Signal} from '@angular/core';
import { take } from 'rxjs';
import { AuthStateService } from '../../service/state/auth.state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileStateService } from '../../service/state/profile.state.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { PendingJoinService } from '../../service/pending-join.service';

@Component({
  selector: 'app-join',
  imports: [TranslocoPipe],
  templateUrl: './join.component.html',
  styleUrl: './join.component.css',
})
export class JoinComponent {
  readonly authStateService: AuthStateService = inject(AuthStateService)
  protected isLogged: Signal<boolean> = this.authStateService.selectLoginStatus();
  errorMessage: string | undefined;

  constructor(
    private profileStateService: ProfileStateService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private pendingJoinService: PendingJoinService,
  ) {
    const uuid = this.activateRoute.snapshot.params['uuid'];
    if (!this.isLogged()) {
      this.pendingJoinService.set(uuid);
      return;
    }

    this.joinGroup(uuid);
  }

  navigateToLogin() {
    this.router.navigate(['login']).then();
  }

  navigateToGroup() {
    this.router.navigate(['group']).then();
  }

  private joinGroup(uuid: string): void {
    this.profileStateService.joinGroupAction(uuid).pipe(take(1)).subscribe(
      {
        next: () => this.pendingJoinService.clear(),
        error: err => {
          this.pendingJoinService.clear();
          if (err.status === 422) {
            this.errorMessage = err.error.message;
          }
        }
      }
    );
  }
}
