import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

import { GroupListComponent } from './list.component';
import { translocoTestingModule } from '../../../testing/transloco-testing';
import { ProfileStateService } from '../../../service/state/profile.state.service';
import { ActivityStateService } from '../../../service/state/activity.state.service';

describe('GroupListComponent', () => {
  let component: GroupListComponent;
  let fixture: ComponentFixture<GroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupListComponent, translocoTestingModule],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ProfileStateService,
          useValue: {
            selectProfileGroups: vi.fn().mockReturnValue(signal([])),
          },
        },
        {
          provide: ActivityStateService,
          useValue: {
            latestActivityForGroup: vi.fn().mockReturnValue(null),
            hasUnreadActivity: vi.fn().mockReturnValue(false),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
