import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { CaishenCustomFormInputComponent } from '../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { AuthHttpService } from '../../service/httpService/auth.http.service';
import { VALID_EMAIL_REGEX } from '../../validator/validator.regex';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, CaishenCustomFormInputComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authHttpService = inject(AuthHttpService);

  protected readonly isLoading = signal(false);
  protected readonly isSent = signal(false);
  protected readonly forgotPasswordForm: FormGroup = this.fb.group({
    email: new FormControl<string>('', [Validators.required, Validators.pattern(VALID_EMAIL_REGEX)]),
  });

  protected getFormFromName(name: string) {
    return this.forgotPasswordForm.get(name) as FormControl<string>;
  }

  protected requestPasswordReset(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authHttpService
      .requestPasswordReset(this.getFormFromName('email').value)
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => this.isSent.set(true),
        error: () => this.isSent.set(true),
      });
  }
}
