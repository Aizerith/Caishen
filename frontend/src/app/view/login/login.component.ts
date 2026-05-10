import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CaishenCustomFormInputComponent } from '../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { AuthFeatureService } from '../../service/featureService/auth.feature.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CaishenCustomFormInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  readonly fb: FormBuilder = inject(FormBuilder);
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);

  protected loginForm: FormGroup = this.fb.group({
    login: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
  });

  getFormFromName(name: string) {
    return this.loginForm.get(name) as FormControl<string>;
  }

  login() {
    this.authFeatureService.loginAction(this.loginForm.get('login')?.value, this.loginForm.get('password')?.value);
  }
}
