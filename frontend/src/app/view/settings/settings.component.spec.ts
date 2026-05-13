import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { translocoTestingModule } from '../../testing/transloco-testing';
import { PushNotificationService } from '../../service/push-notification.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent, translocoTestingModule],
      providers: [
        {
          provide: PushNotificationService,
          useValue: {
            init: vi.fn().mockResolvedValue(undefined),
            enable: vi.fn().mockResolvedValue(undefined),
            disable: vi.fn().mockResolvedValue(undefined),
            isEnabled: signal(false),
            isSupported: signal(true),
            isConfigured: signal(true),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
