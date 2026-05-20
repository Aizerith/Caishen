import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly pendingRequestCount = signal(0);
  private readonly visible = signal(false);
  readonly isLoading = computed(() => this.visible());

  private readonly showDelayMs = 120;
  private readonly minVisibleMs = 450;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private shownAt = 0;

  start(): void {
    this.pendingRequestCount.update((count) => count + 1);
    this.clearHideTimer();

    if (this.visible() || this.showTimer) {
      return;
    }

    this.showTimer = setTimeout(() => {
      this.showTimer = null;

      if (this.pendingRequestCount() > 0) {
        this.shownAt = Date.now();
        this.visible.set(true);
      }
    }, this.showDelayMs);
  }

  stop(): void {
    this.pendingRequestCount.update((count) => Math.max(0, count - 1));

    if (this.pendingRequestCount() > 0) {
      return;
    }

    this.clearShowTimer();

    if (!this.visible()) {
      return;
    }

    const remainingVisibleTime = this.minVisibleMs - (Date.now() - this.shownAt);
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;

      if (this.pendingRequestCount() === 0) {
        this.visible.set(false);
      }
    }, Math.max(0, remainingVisibleTime));
  }

  private clearShowTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
