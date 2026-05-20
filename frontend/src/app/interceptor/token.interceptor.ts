import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthStateService } from '../service/state/auth.state.service';
import { AuthHttpService } from '../service/http/auth.http.service';
import { Router } from '@angular/router';
import { catchError, concatMap, from, Observable, switchMap, tap, throwError } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { AuthFeatureService } from '../service/feature/auth.feature.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  readonly authHttpService: AuthHttpService = inject(AuthHttpService);
  readonly authStateService: AuthStateService = inject(AuthStateService);
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly router: Router = inject(Router);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.endsWith('/refresh') || request.url.endsWith('/login')) {
      return next.handle(request);
    }
    const authState = this.authStateService.authState();
    const accessToken: string | null = authState.accessToken;
    const refreshToken: string | null = authState.refreshToken;
    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
    return next.handle(request).pipe(
      catchError((error) => {
        if ((error.status === 401 || error.status === 403) && refreshToken) {
          return from(this.authHttpService.refreshToken(refreshToken)).pipe(
            catchError((refreshError) =>
              this.authFeatureService.logoutAction().pipe(
                tap(() => this.router.navigate(['login']).then()),
                switchMap(() => throwError(refreshError)),
              ),
            ),
            concatMap((response) => {
              return this.authFeatureService
                .loginByTokenAction(
                  response.headers.get('access_token') as string,
                  response.headers.get('refresh_token') as string,
                )
                .pipe(
                  switchMap(() => {
                    const updatedRequest = request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${this.authStateService.authState().accessToken}`,
                      },
                    });
                    return next.handle(updatedRequest);
                  }),
                );
            }),
          );
        } else {
          return throwError(error);
        }
      }),
    );
  }
}
