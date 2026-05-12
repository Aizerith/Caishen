import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
import { AuthFeatureService } from '../../service/featureService/auth.feature.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-settings',
  imports: [TranslocoPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly themeService: ThemeService = inject(ThemeService);
  readonly translocoService: TranslocoService = inject(TranslocoService);
  readonly route: Router = inject(Router);
  protected readonly isLogged = this.authFeatureService.authStateService.isLogged;
  protected readonly themes = ['caishen', 'night', 'light', 'dark', 'forest', 'lofi'];
  protected readonly languages = ['fr', 'en'];
  protected theme: WritableSignal<string> = signal(localStorage.getItem('theme') ?? 'caishen');
  protected language: WritableSignal<string> = signal(localStorage.getItem('lang') ?? 'fr');

  ngOnInit() {
    this.changeTheme(this.theme());
  }

  changeTheme(theme: string): void {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    this.themeService.updateTheme(theme);
  }

  changeLanguage(language: string): void {
    this.language.set(language);
    localStorage.setItem('lang', language);
    this.translocoService.setActiveLang(language);
  }

  logout() {
    this.authFeatureService.logoutAction().subscribe({
      next: (_) => this.route.navigate(['login']).then(),
    });
  }
}
