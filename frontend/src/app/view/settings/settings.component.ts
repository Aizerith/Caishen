import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
import { AuthFeatureService } from '../../service/featureService/auth.feature.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly themeService: ThemeService = inject(ThemeService);
  readonly route: Router = inject(Router);
  protected readonly themes = ['caishen', 'night', 'light', 'dark', 'forest', 'lofi'];
  protected theme: WritableSignal<string> = signal(localStorage.getItem('theme') ?? 'caishen');

  ngOnInit() {
    this.changeTheme(this.theme());
  }

  changeTheme(theme: string): void {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    this.themeService.updateTheme(theme);
  }

  logout() {
    this.authFeatureService.logoutAction().subscribe({
      next: (_) => this.route.navigate(['login']).then(),
    });
  }
}
