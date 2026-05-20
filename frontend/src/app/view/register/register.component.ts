import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { STRONG_PASSWORD_REGEX, VALID_EMAIL_REGEX, VALID_PSEUDO_REGEX } from '../../validator/validator.regex';
import { CaishenCustomFormInputComponent } from '../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import Validation from '../../validator/validation';
import RegisterRequest = CaiShen.RegisterRequest;
import { AuthFeatureService } from '../../service/feature/auth.feature.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PendingJoinService } from '../../service/pending-join.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CaishenCustomFormInputComponent, TranslocoPipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  readonly fb: FormBuilder = inject(FormBuilder);
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly pendingJoinService: PendingJoinService = inject(PendingJoinService);

  protected registerForm: FormGroup = this.fb.group(
    {
      username: new FormControl<string>('', [Validators.required, Validators.pattern(VALID_PSEUDO_REGEX)]),
      login: new FormControl<string>('', [Validators.required, Validators.pattern(VALID_EMAIL_REGEX)]),
      password: new FormControl<string>('', [Validators.required, Validators.pattern(STRONG_PASSWORD_REGEX)]),
      passwordConfirmation: new FormControl<string>('', [Validators.required]),
    },
    {
      validators: [Validation.match('password', 'passwordConfirmation')],
    },
  );

  ngOnInit() {
    const pendingJoinUuid = this.activatedRoute.snapshot.queryParamMap.get('join');
    if (pendingJoinUuid) {
      this.pendingJoinService.set(pendingJoinUuid);
    }
  }

  private getRegisterData(): RegisterRequest {
    return {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('login')?.value,
      password: this.registerForm.get('password')?.value,
    };
  }

  public getFormFromName(name: string) {
    return this.registerForm.get(name) as FormControl<string>;
  }

  public register() {
    if (this.registerForm.invalid || this.isRegistering) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authFeatureService.registerAction(this.getRegisterData());
  }

  protected get isRegistering(): boolean {
    return this.authFeatureService.isRegistering();
  }
}
