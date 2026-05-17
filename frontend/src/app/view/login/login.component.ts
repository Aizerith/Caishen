import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaishenCustomFormInputComponent } from '../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { AuthFeatureService } from '../../service/featureService/auth.feature.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { PendingJoinService } from '../../service/pending-join.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CaishenCustomFormInputComponent, TranslocoPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  readonly fb: FormBuilder = inject(FormBuilder);
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly pendingJoinService: PendingJoinService = inject(PendingJoinService);

  protected loginForm: FormGroup = this.fb.group({
    login: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
  });

  ngOnInit() {
    const pendingJoinUuid = this.activatedRoute.snapshot.queryParamMap.get('join');
    if (pendingJoinUuid) {
      this.pendingJoinService.set(pendingJoinUuid);
    }
  }

  getFormFromName(name: string) {
    return this.loginForm.get(name) as FormControl<string>;
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authFeatureService.loginAction(this.loginForm.get('login')?.value, this.loginForm.get('password')?.value);
  }
}
