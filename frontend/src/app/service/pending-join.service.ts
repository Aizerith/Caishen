import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PendingJoinService {
  private readonly storageKey = 'pending_join_group_uuid';

  set(uuid: string): void {
    localStorage.setItem(this.storageKey, uuid);
  }

  get(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  consume(): string | null {
    const uuid = this.get();
    this.clear();
    return uuid;
  }
}
