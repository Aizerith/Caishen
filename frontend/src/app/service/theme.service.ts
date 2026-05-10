import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  _theme: WritableSignal<string> = signal('night');

  get theme() {
    return this._theme;
  }

  start() {
    let savedTheme: string | null = localStorage.getItem('theme');
    if (!savedTheme) {
      savedTheme = 'night';
    }
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  updateTheme(theme: string) {
    this._theme.set(theme);
  }
}
