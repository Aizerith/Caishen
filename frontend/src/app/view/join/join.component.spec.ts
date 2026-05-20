import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { JoinComponent } from './join.component';
import { AuthStateService } from '../../service/state/auth.state.service';
import { ProfileStateService } from '../../service/state/profile.state.service';
import { translocoTestingModule } from '../../testing/transloco-testing';
import { PendingJoinService } from '../../service/pending-join.service';

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinComponent, translocoTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                uuid: 'group-uuid',
              },
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ProfileStateService,
          useValue: {
            joinGroupAction: vi.fn().mockReturnValue(of({ id: 1, title: 'Pool Party' })),
          },
        },
        {
          provide: PendingJoinService,
          useValue: {
            set: vi.fn(),
            clear: vi.fn(),
          },
        },
        {
          provide: AuthStateService,
          useValue: {
            selectLoginStatus: vi.fn().mockReturnValue(signal(false)),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
