import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  _theme: WritableSignal<string> = signal('caishen');

  get theme() {
    return this._theme;
  }

  start() {
    let savedTheme: string | null = localStorage.getItem('theme');
    if (!savedTheme) {
      savedTheme = 'caishen';
    }
    this._theme.set(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  updateTheme(theme: string) {
    this._theme.set(theme);
  }
}
