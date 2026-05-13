import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private history: string[] = [];
  private isStarted = false;

  constructor(private router: Router) {}

  start() {
    if (this.isStarted) {
      return;
    }

    this.isStarted = true;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.push(event.urlAfterRedirects);
      }
    });
  }

  back(): void {
    const expenseDetailMatch = this.router.url.match(/^\/group\/(\d+)\/expense\/\d+(?:[?#].*)?$/);
    if (expenseDetailMatch) {
      this.replaceCurrentRoute(`/group/${expenseDetailMatch[1]}`);
      return;
    }

    const previousUrl = this.getPreviousUrl();
    this.replaceCurrentRoute(previousUrl);
  }

  private push(url: string): void {
    if (this.history[this.history.length - 1] !== url) {
      this.history.push(url);
    }
  }

  private getPreviousUrl(): string {
    this.push(this.router.url);

    if (this.history.length <= 1) {
      return '/group';
    }

    this.history.pop();
    return this.history[this.history.length - 1] ?? '/group';
  }

  private replaceCurrentRoute(url: string): void {
    if (this.history.length === 0) {
      this.history.push(url);
    } else {
      this.history[this.history.length - 1] = url;
    }

    this.removeConsecutiveDuplicates();
    this.router.navigateByUrl(url, { replaceUrl: true }).then();
  }

  private removeConsecutiveDuplicates(): void {
    this.history = this.history.filter((url, index) => index === 0 || url !== this.history[index - 1]);
  }
}
