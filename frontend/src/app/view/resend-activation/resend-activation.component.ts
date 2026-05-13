import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { CaishenCustomFormInputComponent } from '../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { AuthHttpService } from '../../service/httpService/auth.http.service';
import { VALID_EMAIL_REGEX } from '../../validator/validator.regex';

@Component({
  selector: 'app-resend-activation',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CaishenCustomFormInputComponent],
  templateUrl: './resend-activation.component.html',
  styleUrl: './resend-activation.component.css',
})
export class ResendActivationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authHttpService = inject(AuthHttpService);

  protected readonly isLoading = signal(false);
  protected readonly isSent = signal(false);
  protected readonly activationForm: FormGroup = this.fb.group({
    email: new FormControl<string>('', [Validators.required, Validators.pattern(VALID_EMAIL_REGEX)]),
  });

  protected getFormFromName(name: string) {
    return this.activationForm.get(name) as FormControl<string>;
  }

  protected requestAccountActivation(): void {
    if (this.activationForm.invalid) {
      this.activationForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authHttpService
      .requestAccountActivation(this.getFormFromName('email').value)
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
