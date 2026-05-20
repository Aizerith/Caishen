import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { GroupDetailsComponent } from './details.component';
import { GroupStateService } from '../../../service/state/group.state.service';
import { NotificationsService } from '../../../service/notifications.service';
import { ProfileStateService } from '../../../service/state/profile.state.service';
import { translocoTestingModule } from '../../../testing/transloco-testing';
import { ActivityStateService } from '../../../service/state/activity.state.service';

describe('GroupDetailsComponent', () => {
  let component: GroupDetailsComponent;
  let fixture: ComponentFixture<GroupDetailsComponent>;
  const groupInfo = {
    id: 1,
    title: 'Pool Party',
    uuid: 'group-uuid',
    memberList: [
      { id: 1, name: 'Shen', expenseDelta: 0 },
    ],
    expenseList: [],
    settlementList: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDetailsComponent, translocoTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                groupId: 1,
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
          provide: GroupStateService,
          useValue: {
            selectMyBalance: vi.fn().mockReturnValue(signal(0)),
            selectGroupInfo: vi.fn().mockReturnValue(signal(groupInfo)),
            selectExpenseHistory: vi.fn().mockReturnValue(signal([])),
            getGroupInfoAction: vi.fn().mockReturnValue(of(groupInfo)),
            getGroupExpenseHistoryAction: vi.fn().mockReturnValue(of([])),
            addExpense: vi.fn().mockReturnValue(of(groupInfo)),
            paySettlement: vi.fn().mockReturnValue(of(groupInfo)),
            cancelSettlementPayment: vi.fn().mockReturnValue(of(groupInfo)),
          },
        },
        {
          provide: ProfileStateService,
          useValue: {
            getMyId: vi.fn().mockReturnValue(1),
          },
        },
        {
          provide: ActivityStateService,
          useValue: {
            hasUnreadActivity: vi.fn().mockReturnValue(false),
            markGroupAsRead: vi.fn(),
            refreshGroupActivityAction: vi.fn().mockReturnValue(of([])),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
