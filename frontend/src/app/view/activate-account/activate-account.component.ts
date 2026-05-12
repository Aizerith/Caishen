import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { AuthHttpService } from '../../service/httpService/auth.http.service';

type ActivationStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-activate-account',
  imports: [RouterLink],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.css',
})
export class ActivateAccountComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authHttpService = inject(AuthHttpService);

  protected readonly status = signal<ActivationStatus>('loading');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      return;
    }

    this.authHttpService
      .activateAccount(token)
      .pipe(take(1))
      .subscribe({
        next: () => this.status.set('success'),
        error: () => this.status.set('error'),
      });
  }
}
