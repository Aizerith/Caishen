import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
import { AuthFeatureService } from '../../service/featureService/auth.feature.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PushNotificationService } from '../../service/push-notification.service';
import { NotificationsService } from '../../service/notifications.service';

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
  readonly pushNotificationService: PushNotificationService = inject(PushNotificationService);
  readonly notificationsService: NotificationsService = inject(NotificationsService);
  readonly route: Router = inject(Router);
  protected readonly isLogged = this.authFeatureService.authStateService.isLogged;
  protected readonly themes = ['caishen', 'night', 'light', 'dark', 'forest', 'lofi'];
  protected readonly languages = ['fr', 'en'];
  protected theme: WritableSignal<string> = signal(localStorage.getItem('theme') ?? 'caishen');
  protected language: WritableSignal<string> = signal(localStorage.getItem('lang') ?? 'fr');

  ngOnInit() {
    this.changeTheme(this.theme());
    this.pushNotificationService.init();
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

  async togglePushNotifications(): Promise<void> {
    if (this.pushNotificationService.isEnabled()) {
      await this.pushNotificationService.disable();
      return;
    }

    await this.pushNotificationService.enable();
  }

  async sendTestPushNotification(): Promise<void> {
    try {
      await this.pushNotificationService.sendTestNotification();
      this.notificationsService.showSuccess(this.translocoService.translate('settings.pushTestSent'));
    } catch {
      this.notificationsService.showError(this.translocoService.translate('settings.pushTestError'));
    }
  }
}
