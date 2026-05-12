import { Component } from '@angular/core';

@Component({
  selector: 'app-caishen-custom-snackbar',
  templateUrl: './caishen-custom-snackbar.component.html',
  styleUrl: './caishen-custom-snackbar.component.css',
})
export class CaishenCustomSnackbarComponent {
  message = '';
  visible = false;
  isError: boolean = false;

  showSuccess(message: string, duration = 3000) {
    this.message = message;
    this.visible = true;
    this.isError = false;
    setTimeout(() => (this.visible = false), duration);
  }

  showError(message: string, duration = 3000) {
    this.message = message;
    this.visible = true;
    this.isError = true;
    setTimeout(() => (this.visible = false), duration);
  }
}
