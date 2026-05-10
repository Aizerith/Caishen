import { Injectable } from '@angular/core';
import { CaishenCustomSnackbarComponent } from '../component/caishen-custom-snackbar/caishen-custom-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private snackbarComponent!: CaishenCustomSnackbarComponent;

  public register(snackbar: CaishenCustomSnackbarComponent) {
    this.snackbarComponent = snackbar;
  }

  public showSuccess(message: string, duration = 3000) {
    this.snackbarComponent?.showSuccess(message, duration);
  }

  public showError(message: string, duration = 3000) {
    this.snackbarComponent?.showError(message, duration);
  }
}
