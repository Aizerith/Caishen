import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { CheckComponent } from './check.component';
import { GroupStateService } from '../../../service/stateService/group.state.service';
import { NotificationsService } from '../../../service/notifications.service';
import { ProfileStateService } from '../../../service/stateService/profile.state.service';

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;
  const groupInfo = {
    id: 1,
    title: 'Pool Party',
    uuid: 'group-uuid',
    memberList: [
      { id: 1, name: 'Shen', expenseDelta: 0 },
    ],
    expenseList: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 1,
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
          provide: NotificationsService,
          useValue: {
            showSuccess: vi.fn(),
            showError: vi.fn(),
          },
        },
        {
          provide: ProfileStateService,
          useValue: {
            selectProfileState: vi.fn().mockReturnValue(of({ info: { id: 1 } })),
            getMyId: vi.fn().mockReturnValue(1),
          },
        },
        {
          provide: GroupStateService,
          useValue: {
            selectMyBalance: vi.fn().mockReturnValue(of(0)),
            selectGroupInfo: vi.fn().mockReturnValue(of(groupInfo)),
            getGroupInfoAction: vi.fn().mockReturnValue(of(groupInfo)),
            addExpense: vi.fn().mockReturnValue(of(groupInfo)),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
