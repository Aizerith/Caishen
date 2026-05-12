import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { CaishenCustomFormInputComponent } from '../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { AuthHttpService } from '../../service/httpService/auth.http.service';
import Validation from '../../validator/validation';
import { STRONG_PASSWORD_REGEX } from '../../validator/validator.regex';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, CaishenCustomFormInputComponent, TranslocoPipe],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authHttpService = inject(AuthHttpService);

  protected readonly isLoading = signal(false);
  protected readonly hasInvalidToken = signal(false);
  protected readonly resetPasswordForm: FormGroup = this.fb.group(
    {
      password: new FormControl<string>('', [Validators.required, Validators.pattern(STRONG_PASSWORD_REGEX)]),
      passwordConfirmation: new FormControl<string>('', [Validators.required]),
    },
    {
      validators: [Validation.match('password', 'passwordConfirmation')],
    },
  );

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.hasInvalidToken.set(!this.token);
  }

  protected getFormFromName(name: string) {
    return this.resetPasswordForm.get(name) as FormControl<string>;
  }

  protected confirmPasswordReset(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authHttpService
      .confirmPasswordReset(this.token, this.getFormFromName('password').value)
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => this.router.navigate(['login']).then(),
        error: () => this.hasInvalidToken.set(true),
      });
  }
}
