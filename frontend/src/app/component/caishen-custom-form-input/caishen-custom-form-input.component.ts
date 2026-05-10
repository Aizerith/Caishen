import {Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-caishen-custom-form-input',
  imports: [NgIf, ReactiveFormsModule, NgClass],
  templateUrl: './caishen-custom-form-input.component.html',
  styleUrl: './caishen-custom-form-input.component.css',
})
export class CaishenCustomFormInputComponent {
  @Input() placeholder: string = 'placeHolder';
  @Input() hasError: boolean = true;
  @Input() errorMessage: string = 'errorMessage';
  @Input() type: 'text' | 'password' | 'email' | 'tel' | 'date' | 'number' = 'text';
  @Input() inputForm!: FormControl<string>;
  @Input() icon: string | undefined;
}
