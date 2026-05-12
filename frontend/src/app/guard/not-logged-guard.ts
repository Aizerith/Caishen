import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStateService } from '../service/stateService/auth.state.service';

@Injectable({
  providedIn: 'root',
})
export class NotLoggedGuard {
  constructor(
    private router: Router,
    private loginStateService: AuthStateService,
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): boolean | UrlTree {
    return this.loginStateService.authState().loginStatus === 'NOT_LOGGED'
      ? true
      : this.router.createUrlTree(['']);
  }
}
