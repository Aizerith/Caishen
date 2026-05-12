import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

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
}
