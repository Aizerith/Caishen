import { TranslocoTestingModule } from '@jsverse/transloco';

export const translocoTestingModule = TranslocoTestingModule.forRoot({
  langs: {
    fr: {},
    en: {},
  },
  translocoConfig: {
    availableLangs: ['fr', 'en'],
    defaultLang: 'fr',
    fallbackLang: 'fr',
    prodMode: true,
  },
});
