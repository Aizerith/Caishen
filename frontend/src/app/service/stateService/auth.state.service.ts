import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthHttpService } from '../httpService/auth.http.service';
import RegisterRequest = CaiShen.RegisterRequest;
import { NotificationsService } from '../notifications.service';

export interface AuthStateInterface {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  id: number | null;
  isRemembered: boolean | null;
  expirationDate: Date | null;
  loginStatus: LoginStatus;
  hasError: boolean;
}

export type LoginStatus = 'INIT_LOGIN' | 'START_LOGIN' | 'SUCCESS' | 'FAILURE' | 'NOT_LOGGED' | 'LOGGED';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  readonly authHttpService: AuthHttpService = inject(AuthHttpService);
  readonly notificationService: NotificationsService = inject(NotificationsService);

  private readonly initialState: AuthStateInterface = {
    accessToken: null,
    refreshToken: null,
    username: null,
    id: null,
    isRemembered: null,
    expirationDate: null,
    loginStatus: 'NOT_LOGGED',
    hasError: false,
  };

  private _authState: WritableSignal<AuthStateInterface> = signal(this.initialState);
  readonly isLogged: Signal<boolean> = computed(() => this._authState().loginStatus === 'LOGGED');

  get authState(): WritableSignal<AuthStateInterface> {
    return this._authState;
  }

  updateState(newState: Partial<AuthStateInterface>): void {
    this._authState.update((state) => ({
      ...state,
      ...newState,
    }));
  }

  selectLoginStatus(): Signal<boolean> {
    return this.isLogged;
  }

  public registerAction(data: RegisterRequest): Observable<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.authHttpService.register(data).pipe(
      switchMap((value) => {
        const accessToken: string | null = value.token;
        const refreshToken: string | null = value.refreshToken;

        if (accessToken && refreshToken) {
          return of({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
          return throwError(() => new Error('Token not present'));
        }
      }),
      catchError((err) => {
        this.updateState({
          hasError: err.error.message,
        });
        if (err.error.code.includes('UsernameAlreadyTaken')) {
          this.notificationService.showError('Email déjà utilisé');
        } else {
          this.notificationService.showError("Erreur lors de l'inscription, veuillez réessayer");
        }
        return of();
      }),
    );
  }
}
