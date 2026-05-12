import {Component, inject, Signal} from '@angular/core';
import { take } from 'rxjs';
import { AuthStateService } from '../../service/stateService/auth.state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileStateService } from '../../service/stateService/profile.state.service';

@Component({
  selector: 'app-join',
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
  ) {
    this.profileStateService.joinGroupAction(this.activateRoute.snapshot.params['uuid']).pipe(take(1)).subscribe(
      {
        error: err => {
          if (err.status === 422) {
            this.errorMessage = err.error.message;
          }
        }
      }
    );
  }

  navigateToLogin() {
    this.router.navigate(['login']).then();
  }

  navigateToGroup() {
    this.router.navigate(['group']).then();
  }
}
