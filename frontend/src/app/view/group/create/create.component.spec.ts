import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { GroupCreateComponent } from './create.component';
import { translocoTestingModule } from '../../../testing/transloco-testing';
import { GroupHttpService } from '../../../service/http/group.http.service';
import { NotificationsService } from '../../../service/notifications.service';
import { ProfileStateService } from '../../../service/state/profile.state.service';

describe('GroupCreateComponent', () => {
  let component: GroupCreateComponent;
  let fixture: ComponentFixture<GroupCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCreateComponent, translocoTestingModule],
      providers: [
        {
          provide: GroupHttpService,
          useValue: {
            addGroup: vi.fn().mockReturnValue(of({ id: 1, title: 'Pool Party' })),
          },
        },
        {
          provide: ProfileStateService,
          useValue: {
            getMyId: vi.fn().mockReturnValue(1),
            updateGroup: vi.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            showSuccess: vi.fn(),
            showError: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
