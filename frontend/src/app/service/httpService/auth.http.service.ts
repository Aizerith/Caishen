import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import RegisterRequest = CaiShen.RegisterRequest;
import LoginRequest = CaiShen.LoginRequest;
import LoginResponse = CaiShen.LoginResponse;
import PasswordResetRequest = CaiShen.PasswordResetRequest;
import PasswordResetConfirmRequest = CaiShen.PasswordResetConfirmRequest;
import AccountActivationRequest = CaiShen.AccountActivationRequest;

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  baseUrl: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  public login(mail: string, password: string) {
    const data: LoginRequest = {
      email: mail,
      password: password,
    };
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, data);
  }

  public register(data: RegisterRequest) {
    return this.http.post<void>(`${this.baseUrl}/auth/register`, data);
  }

  public activateAccount(token: string) {
    return this.http.get<void>(`${this.baseUrl}/auth/activate`, {
      params: { token },
    });
  }

  public requestAccountActivation(email: string) {
    const data: AccountActivationRequest = { email };
    return this.http.post<void>(`${this.baseUrl}/auth/activation/request`, data);
  }

  public requestPasswordReset(email: string) {
    const data: PasswordResetRequest = { email };
    return this.http.post<void>(`${this.baseUrl}/auth/password-reset/request`, data);
  }

  public confirmPasswordReset(token: string, password: string) {
    const data: PasswordResetConfirmRequest = { token, password };
    return this.http.post<void>(`${this.baseUrl}/auth/password-reset/confirm`, data);
  }

  public refreshToken(refreshToken: string) {
    return this.http.post(
      `${this.baseUrl}/auth/refresh`,
      {},
      {
        observe: 'response',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
  }
}
