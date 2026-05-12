import { Component, effect, inject, Signal, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CaishenCustomSnackbarComponent } from './component/caishen-custom-snackbar/caishen-custom-snackbar.component';
import { NotificationsService } from './service/notifications.service';
import { NavigationService } from './service/navigation.service';
import { ProfileStateService } from './service/stateService/profile.state.service';
import { switchMap, take } from 'rxjs';
import { ThemeService } from './service/theme.service';
import { WebSocketService } from './web-socket/web-socket.service';
import { GroupStateService } from './service/stateService/group.state.service';
import { AuthFeatureService } from './service/featureService/auth.feature.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, CaishenCustomSnackbarComponent, TranslocoPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @ViewChild(CaishenCustomSnackbarComponent) snackbar!: CaishenCustomSnackbarComponent;

  readonly router: Router = inject(Router);
  readonly themeService: ThemeService = inject(ThemeService);
  readonly notificationService: NotificationsService = inject(NotificationsService);
  readonly navigationService: NavigationService = inject(NavigationService);
  readonly profileStateService: ProfileStateService = inject(ProfileStateService);
  readonly webSocketService: WebSocketService = inject(WebSocketService);
  readonly groupStateService: GroupStateService = inject(GroupStateService);
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);

  protected theme: Signal<string> = this.themeService.theme;

  constructor() {
    this.webSocketService
      .watchNotifications()
      .pipe(switchMap((value) => this.groupStateService.getGroupInfoAction(Number(value))))
      .subscribe();

    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
    });
  }

  ngOnInit() {
    this.themeService.start();
    this.authFeatureService
      .initLoginAction()
      .pipe(
        switchMap((_) => this.profileStateService.getProfileAction()),
        take(1),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    this.notificationService.register(this.snackbar);
  }

  navigateToSettings() {
    this.router.navigate(['settings']).then();
  }

  navigateBack() {
    this.navigationService.back();
  }

}
