import { Component, effect, inject, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CaishenCustomSnackbarComponent } from './component/caishen-custom-snackbar/caishen-custom-snackbar.component';
import { NotificationsService } from './service/notifications.service';
import { NavigationService } from './service/navigation.service';
import { ProfileStateService } from './service/stateService/profile.state.service';
import { forkJoin, switchMap, take } from 'rxjs';
import { ThemeService } from './service/theme.service';
import { WebSocketService } from './web-socket/web-socket.service';
import { GroupStateService } from './service/stateService/group.state.service';
import { AuthFeatureService } from './service/featureService/auth.feature.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

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
  readonly authFeatureService: AuthFeatureService = inject(AuthFeatureService);
  readonly swUpdate: SwUpdate = inject(SwUpdate);

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
            this.groupStateService.getGroupInfoAction(groupId),
            this.groupStateService.getGroupExpenseHistoryAction(groupId),
          ]);
        }),
      )
      .subscribe();

    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt.set(event as BeforeInstallPromptEvent);
      this.showInstallBanner.set(true);
      window.setTimeout(() => this.showInstallBanner.set(false), 6000);
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
