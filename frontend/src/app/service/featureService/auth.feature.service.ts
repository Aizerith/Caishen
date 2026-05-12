import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { finalize, Observable, of, switchMap, take } from 'rxjs';
import { AuthHttpService } from '../httpService/auth.http.service';
import { AuthStateInterface, AuthStateService } from '../stateService/auth.state.service';
import { UserToken } from '../../definitions/interface/user-token.interface';
import { jwtDecode } from 'jwt-decode';
import { NotificationsService } from '../notifications.service';
import { ProfileStateService } from '../stateService/profile.state.service';
import { Router } from '@angular/router';
import RegisterRequest = CaiShen.RegisterRequest;

@Injectable({
  providedIn: 'root',
})
export class AuthFeatureService {
  readonly authHttpService: AuthHttpService = inject(AuthHttpService);
  readonly authStateService: AuthStateService = inject(AuthStateService);
  readonly notificationService: NotificationsService = inject(NotificationsService);
  readonly profileStateService: ProfileStateService = inject(ProfileStateService);
  readonly router: Router = inject(Router);
  isLogin: WritableSignal<Boolean> = signal(false);
  isRegistering: WritableSignal<boolean> = signal(false);

  initLoginAction(): Observable<AuthStateInterface> {
    this.authStateService.updateState({ loginStatus: 'INIT_LOGIN' });
    const accessToken: string | null = localStorage.getItem('access_token');
    const refreshToken: string | null = localStorage.getItem('refresh_token');

    if (accessToken && refreshToken) {
      return this.loginSuccessAction(accessToken, refreshToken);
    } else {
      this.loginFailureAction(false);
      return of();
    }
  }

  loginSuccessAction(accessToken: string, refreshToken: string): Observable<AuthStateInterface> {
    this.authStateService.updateState({ loginStatus: 'SUCCESS' });
    const decodedAccessToken: UserToken = jwtDecode<UserToken>(accessToken);

    return this.logUserAction(
      accessToken,
      decodedAccessToken.sub,
      decodedAccessToken.id,
      decodedAccessToken.remember,
      decodedAccessToken.exp,
      refreshToken,
    );
  }

  loginFailureAction(hasError: boolean): void {
    const newState: Partial<AuthStateInterface> = {
      loginStatus: 'FAILURE',
      hasError: hasError,
    };
    this.authStateService.updateState(newState);
    this.logoutAction().pipe(take(1)).subscribe();
  }

  logUserAction(
    accessToken: string,
    sub: string,
    id: number,
    remember: boolean,
    exp: Date,
    refreshToken: string,
  ): Observable<AuthStateInterface> {
    const newState: Partial<AuthStateInterface> = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      username: sub,
      id: id,
      isRemembered: remember,
      expirationDate: exp,
      loginStatus: 'LOGGED',
    };
    this.authStateService.updateState(newState);

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    return of(this.authStateService.authState());
  }

  loginAction(username: string, password: string) {
    this.isLogin.set(true);
    const newState: Partial<AuthStateInterface> = {
      loginStatus: 'START_LOGIN',
      hasError: false,
    };
    this.authStateService.updateState(newState);

    this.authHttpService
      .login(username, password)
      .pipe(
        finalize(() => this.isLogin.set(false)),
        switchMap((value) => {
          const accessToken: string | null = value.token;
          const refreshToken: string | null = value.refreshToken;
          if (accessToken && refreshToken) {
            return this.loginSuccessAction(accessToken, refreshToken);
          } else {
            this.loginFailureAction(true);
            return of();
          }
        }),
        switchMap((_) => this.profileStateService.getProfileAction()),
      )
      .subscribe({
        next: (_) => this.router.navigate(['group']).then(),
        error: (err) => {
          if (err.error?.code?.includes('AccountNotActivatedException')) {
            this.notificationService.showError('Compte non active. Verifiez vos emails.');
            return;
          }
          this.notificationService.showError('Identifiants incorrects, veuillez reessayer');
        },
      });
  }

  logoutAction(): Observable<void> {
    const newState: Partial<AuthStateInterface> = {
      accessToken: null,
      refreshToken: null,
      username: null,
      id: null,
      isRemembered: null,
      expirationDate: null,
      loginStatus: 'NOT_LOGGED',
    };
    this.authStateService.updateState(newState);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    return of(undefined);
  }

  loginByTokenAction(accessToken: string, refreshToken: string): Observable<void> {
    const newState: Partial<AuthStateInterface> = {
      loginStatus: 'START_LOGIN',
      hasError: false,
    };
    this.authStateService.updateState(newState);

    return this.loginSuccessAction(accessToken, refreshToken).pipe(switchMap(() => of(undefined)));
  }

  public registerAction(data: RegisterRequest) {
    this.isRegistering.set(true);
    this.authHttpService
      .register(data)
      .pipe(finalize(() => this.isRegistering.set(false)))
      .subscribe({
        next: (_) => {
          this.router.navigate(['login']).then();
          this.notificationService.showSuccess('Compte cree. Verifiez vos emails pour l activer.', 5000);
        },
        error: (err) => {
          this.authStateService.updateState({
            hasError: err.error?.message,
          });
          if (err.error?.code?.includes('UserAlreadyExistsException')) {
            this.notificationService.showError('Email ou pseudo deja utilise');
          } else {
            this.notificationService.showError("Erreur lors de l'inscription, veuillez reessayer");
          }
        },
      });
  }
}
