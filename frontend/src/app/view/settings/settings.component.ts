import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
import { AuthFeatureService } from '../../service/featureService/auth.feature.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly themeService: ThemeService = inject(ThemeService);
  readonly route: Router = inject(Router);
  protected theme: FormControl<string> = new FormControl();

  ngOnInit() {
    let savedTheme: string | null = localStorage.getItem('theme');
    savedTheme
      ? this.theme.setValue(savedTheme, { emitEvent: false })
      : this.theme.setValue('night', { emitEvent: false });
    this.theme.valueChanges.subscribe((value) => {
      localStorage.setItem('theme', value!);
      this.changeTheme(this.theme.value!);
    });
  }

  changeTheme(theme: string): void {
    this.themeService.updateTheme(theme);
  }

  logout() {
    this.authFeatureService.logoutAction().subscribe({
      next: (_) => this.route.navigate(['login']).then(),
    });
  }
}
