import { Component, effect, inject, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CaishenCustomSnackbarComponent } from './component/caishen-custom-snackbar/caishen-custom-snackbar.component';
import { NotificationsService } from './service/notifications.service';
import { NavigationService } from './service/navigation.service';
import { ProfileStateService } from './service/state/profile.state.service';
import { forkJoin, switchMap, take } from 'rxjs';
import { ThemeService } from './service/theme.service';
import { WebSocketService } from './web-socket/web-socket.service';
import { GroupStateService } from './service/state/group.state.service';
import { ActivityStateService } from './service/state/activity.state.service';
import { AuthFeatureService } from './service/feature/auth.feature.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { PushNotificationService } from './service/push-notification.service';
import { LoadingService } from './service/loading.service';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

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
  readonly activityStateService: ActivityStateService = inject(ActivityStateService);
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly swUpdate: SwUpdate = inject(SwUpdate);
  readonly pushNotificationService: PushNotificationService = inject(PushNotificationService);
  readonly loadingService: LoadingService = inject(LoadingService);

  protected theme: Signal<string> = this.themeService.theme;
  protected installPrompt: WritableSignal<BeforeInstallPromptEvent | null> = signal(null);
  protected showInstallBanner: WritableSignal<boolean> = signal(false);
  protected updateAvailable: WritableSignal<boolean> = signal(false);

  constructor() {
    this.webSocketService
      .watchNotifications()
      .pipe(
        switchMap((value) => {
          const groupId = Number(value);
          return forkJoin([
            this.profileStateService.getProfileAction(),
            this.activityStateService.refreshGroupActivityAction(),
            this.groupStateService.getGroupInfoAction(groupId),
            this.groupStateService.getGroupExpenseHistoryAction(groupId),
          ]);
        }),
      )
      .subscribe();

    this.pushNotificationService
      .messages()
      .subscribe((message) => {
        this.refreshSessionWhenLogged();
        this.showForegroundPushMessage(message);
      });

    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt.set(event as BeforeInstallPromptEvent);
      this.showInstallBanner.set(true);
      window.setTimeout(() => this.showInstallBanner.set(false), 6000);
    });

    window.addEventListener('focus', () => this.refreshSessionWhenLogged());
    window.addEventListener('pageshow', () => this.refreshSessionWhenLogged());
    window.addEventListener('online', () => this.refreshSessionWhenLogged());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.refreshSessionWhenLogged();
      }
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
        .subscribe(() => this.updateAvailable.set(true));
    }
  }

  ngOnInit() {
    this.themeService.start();
    this.navigationService.start();
    this.authFeatureService
      .initLoginAction()
      .pipe(
        switchMap((_) => this.profileStateService.getProfileAction()),
        switchMap((_) => this.activityStateService.refreshGroupActivityAction()),
        take(1),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    this.notificationService.register(this.snackbar);
  }

  private refreshSessionWhenLogged(): void {
    if (!this.authFeatureService.authStateService.isLogged()) {
      return;
    }

    this.profileStateService.getProfileAction().pipe(take(1)).subscribe();
    this.activityStateService.refreshGroupActivityAction().pipe(take(1)).subscribe();

    const groupId = this.getCurrentGroupId();
    if (!groupId) {
      return;
    }

    this.groupStateService.getGroupInfoAction(groupId).pipe(take(1)).subscribe();
    this.groupStateService.getGroupExpenseHistoryAction(groupId).pipe(take(1)).subscribe();
  }

  private getCurrentGroupId(): number | null {
    const match = this.router.url.match(/\/group\/(\d+)/);
    if (!match) {
      return null;
    }

    const groupId = Number(match[1]);
    return Number.isNaN(groupId) ? null : groupId;
  }

  private showForegroundPushMessage(message: object): void {
    const notification = (message as { notification?: { title?: string; body?: string } }).notification;
    if (!notification?.title) {
      return;
    }

    const text = notification.body ? `${notification.title} - ${notification.body}` : notification.title;
    this.notificationService.showSuccess(text);
  }

  navigateToSettings() {
    this.router.navigate(['settings']).then();
  }

  navigateBack() {
    this.navigationService.back();
  }

  async installApp(): Promise<void> {
    const prompt = this.installPrompt();
    if (!prompt) {
      return;
    }
    await prompt.prompt();
    await prompt.userChoice;
    this.installPrompt.set(null);
    this.showInstallBanner.set(false);
  }

  dismissInstallPrompt(): void {
    this.showInstallBanner.set(false);
  }

  async updateApp(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate();
    }
    window.location.reload();
  }

  dismissUpdate(): void {
    this.updateAvailable.set(false);
  }

}
