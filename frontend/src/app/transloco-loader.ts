import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { DEFAULT_LANG, getSupportedLang } from './i18n/supported-languages';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    const supportedLang = getSupportedLang(lang);

    return this.http.get<Translation>(`/assets/i18n/${supportedLang}.json`).pipe(
      catchError((error) => {
        if (supportedLang === DEFAULT_LANG) {
          return throwError(() => error);
        }

        return this.http.get<Translation>(`/assets/i18n/${DEFAULT_LANG}.json`);
      }),
    );
  }
}
