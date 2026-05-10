import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { AuthStateInterface, AuthStateService } from '../service/stateService/auth.state.service';

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
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const loginState$: Observable<AuthStateInterface> = this.loginStateService.selectAuthStateAsObservable();
    return loginState$.pipe(
      map((value) => value.loginStatus === 'NOT_LOGGED'),
      tap((value) => {
        if (!value) {
          this.router.navigate(['']).then();
        }
      }),
    );
  }
}
