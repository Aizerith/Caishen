import { DatePipe } from '@angular/common';
import { Component, ElementRef, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CaishenAddExpenseModalComponent } from '../../../component/caishen-add-expense-modal/caishen-add-expense-modal.component';
import { NotificationsService } from '../../../service/notifications.service';
import { ProfileStateService } from '../../../service/state/profile.state.service';
import { GroupStateService } from '../../../service/state/group.state.service';
import { ActivityStateService } from '../../../service/state/activity.state.service';
import ExpenseRequest = CaiShen.ExpenseRequest;
import ExpenseResponse = CaiShen.ExpenseResponse;
import GroupResponse = CaiShen.GroupResponse;
import ExpenseHistoryResponse = CaiShen.ExpenseHistoryResponse;
import SettlementResponse = CaiShen.SettlementResponse;
import SettlementPaymentRequest = CaiShen.SettlementPaymentRequest;

@Component({
  selector: 'app-group-details',
  imports: [CaishenAddExpenseModalComponent, DatePipe, TranslocoPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class GroupDetailsComponent {
  @ViewChild('settlementModal') settlementModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('cancelSettlementModal') cancelSettlementModal!: ElementRef<HTMLDialogElement>;

  protected readonly Math = Math;
  groupId!: number;
  groupInfo: Signal<GroupResponse | null>;
  expenseHistory: Signal<ExpenseHistoryResponse[]>;
  myBalance: Signal<number>;
  expenseForm: FormGroup;
  currentTab: WritableSignal<'expense' | 'balance' | 'history'> = signal('expense');
  payingSettlementKey: WritableSignal<string | null> = signal(null);
  cancellingSettlementPaymentId: WritableSignal<number | null> = signal(null);
  selectedSettlement: WritableSignal<SettlementResponse | null> = signal(null);
  selectedSettlementHistory: WritableSignal<ExpenseHistoryResponse | null> = signal(null);
  activityReadBoundary: WritableSignal<number> = signal(0);

  constructor(
    private activateRoute: ActivatedRoute,
    private notificationsService: NotificationsService,
    private groupStateService: GroupStateService,
    private profileStateService: ProfileStateService,
    readonly activityStateService: ActivityStateService,
    private router: Router,
    private fb: FormBuilder,
    private translocoService: TranslocoService,
  ) {
    this.myBalance = this.groupStateService.selectMyBalance();
    this.expenseHistory = this.groupStateService.selectExpenseHistory();
    this.groupId = this.activateRoute.snapshot.params['groupId'];
    this.groupInfo = this.groupStateService.selectGroupInfo();
    this.groupStateService.getGroupInfoAction(this.groupId).pipe(take(1)).subscribe();
    this.expenseForm = this.fb.group({
      title: new FormControl<string>('', [Validators.required]),
      amount: new FormControl<string>('', [Validators.required]),
      payerId: new FormControl<number | undefined>(undefined, [Validators.required]),
      expenseDate: new FormControl<string>('', [Validators.required]),
      participants: this.fb.array([]),
    });
  }

  copyInvitationLink(uuid: string) {
    navigator.clipboard
      .writeText(environment.URL + '/join/' + uuid)
      .then(() => this.notificationsService.showSuccess(this.translocoService.translate('group.invitationCopied')));
  }

  private getExpenseRequestFromForm(): ExpenseRequest {
    return {
      groupId: this.groupId,
      expenseDate: this.expenseForm.get('expenseDate')?.value,
      title: this.expenseForm.get('title')?.value,
      amount: this.expenseForm.get('amount')?.value,
      payerId: this.expenseForm.get('payerId')?.value,
      participant: (this.expenseForm.get('participants')?.value as string[]).join(' ').trim(),
    };
  }

  addExpense() {
    const title = this.expenseForm.get('title')?.value;
    this.groupStateService
      .addExpense(this.getExpenseRequestFromForm())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationsService.showSuccess(this.translocoService.translate('expense.created', { title }));
          this.expenseForm.reset();
        },
        error: () => this.notificationsService.showError(this.translocoService.translate('expense.createError', { title })),
      });
  }

  changeTabToExpense() {
    this.currentTab.set('expense');
  }

  changeTabToBalance() {
    this.currentTab.set('balance');
  }

  changeTabToHistory() {
    this.currentTab.set('history');
    this.activityReadBoundary.set(this.activityStateService.getReadHistoryId(this.groupId));
    this.groupStateService.getGroupExpenseHistoryAction(this.groupId).pipe(take(1)).subscribe((history) => {
      this.activityStateService.markGroupAsRead(this.groupId, history[0]?.id);
    });
  }

  getHistoryTranslationKey(action: CaiShen.ExpenseHistoryAction) {
    return `expense.historyActions.${action}`;
  }

  getHistoryTitle(history: ExpenseHistoryResponse) {
    if (history.action === 'UPDATED') {
      return this.translocoService.translate('expense.historyUpdatedBy', { actor: history.actorName });
    }

    const key = this.getHistoryTranslationKey(history.action);
    const translated = this.translocoService.translate(key);
    if (translated !== key) {
      return translated;
    }

    const fallback: Record<CaiShen.ExpenseHistoryAction, string> = {
      CREATED: 'Dépense créée',
      UPDATED: `Dépense modifiée par ${history.actorName}`,
      DELETED: 'Dépense supprimée',
      MEMBER_JOINED: 'Membre ajouté',
      SETTLEMENT_PAID: 'Règlement payé',
      SETTLEMENT_CANCELLED: 'Règlement annulé',
    };
    return fallback[history.action];
  }

  isNewActivity(history: ExpenseHistoryResponse) {
    return history.actorId !== this.profileStateService.getMyId() && history.id > this.activityReadBoundary();
  }

  getHistoryFieldTranslationKey(field: string) {
    return `expense.historyFields.${field}`;
  }

  getSettlementTranslationKey(settlement: SettlementResponse) {
    if (this.isMySettlement(settlement)) {
      return 'group.settlementLineMine';
    }

    return 'group.settlementLine';
  }

  isMySettlement(settlement: SettlementResponse) {
    return settlement.debtorId === this.profileStateService.getMyId();
  }

  getSettlementKey(settlement: SettlementResponse) {
    return `${settlement.debtorId}-${settlement.creditorId}-${settlement.amount}`;
  }

  openSettlementModal(settlement: SettlementResponse) {
    if (!this.isMySettlement(settlement) || this.payingSettlementKey() !== null) {
      return;
    }

    this.selectedSettlement.set(settlement);
    this.settlementModal.nativeElement.showModal();
  }

  closeSettlementModal() {
    if (this.payingSettlementKey() !== null) {
      return;
    }

    this.settlementModal.nativeElement.close();
    this.selectedSettlement.set(null);
  }

  closeCancelSettlementModal() {
    if (this.cancellingSettlementPaymentId() !== null) {
      return;
    }

    this.cancelSettlementModal.nativeElement.close();
    this.selectedSettlementHistory.set(null);
  }

  confirmSettlementPayment() {
    const settlement = this.selectedSettlement();
    if (!settlement) {
      return;
    }

    this.paySettlement(settlement);
  }

  paySettlement(settlement: SettlementResponse) {
    const settlementKey = this.getSettlementKey(settlement);
    if (this.payingSettlementKey() !== null) {
      return;
    }

    this.payingSettlementKey.set(settlementKey);
    const data: SettlementPaymentRequest = {
      groupId: this.groupId,
      receiverId: settlement.creditorId,
      amount: settlement.amount,
    };

    this.groupStateService
      .paySettlement(data)
      .pipe(
        take(1),
        finalize(() => this.payingSettlementKey.set(null)),
      )
      .subscribe({
        next: () => {
          this.notificationsService.showSuccess(this.translocoService.translate('group.settlementPaid'));
          this.groupStateService.getGroupExpenseHistoryAction(this.groupId).pipe(take(1)).subscribe();
          this.settlementModal.nativeElement.close();
          this.selectedSettlement.set(null);
        },
        error: () => this.notificationsService.showError(this.translocoService.translate('group.settlementPayError')),
      });
  }

  canCancelSettlementPayment(history: ExpenseHistoryResponse) {
    return history.action === 'SETTLEMENT_PAID'
      && history.expenseId !== null
      && history.actorId === this.profileStateService.getMyId()
      && !this.isSettlementPaymentCancelled(history.expenseId);
  }

  private isSettlementPaymentCancelled(paymentId: number) {
    return this.expenseHistory().some((history) => history.action === 'SETTLEMENT_CANCELLED' && history.expenseId === paymentId);
  }

  openCancelSettlementModal(history: ExpenseHistoryResponse) {
    if (!this.canCancelSettlementPayment(history) || this.cancellingSettlementPaymentId() !== null) {
      return;
    }

    this.selectedSettlementHistory.set(history);
    this.cancelSettlementModal.nativeElement.showModal();
  }

  confirmCancelSettlementPayment() {
    const history = this.selectedSettlementHistory();
    if (!history?.expenseId) {
      return;
    }

    const paymentId = history.expenseId;
    this.cancellingSettlementPaymentId.set(paymentId);
    this.groupStateService
      .cancelSettlementPayment(paymentId)
      .pipe(
        take(1),
        finalize(() => this.cancellingSettlementPaymentId.set(null)),
      )
      .subscribe({
        next: () => {
          this.notificationsService.showSuccess(this.translocoService.translate('group.settlementCancelled'));
          this.groupStateService.getGroupExpenseHistoryAction(this.groupId).pipe(take(1)).subscribe(() => {
            this.activityStateService.refreshGroupActivityAction().pipe(take(1)).subscribe(() => {
              this.activityStateService.markGroupAsRead(this.groupId);
            });
          });
          this.cancelSettlementModal.nativeElement.close();
          this.selectedSettlementHistory.set(null);
        },
        error: () => this.notificationsService.showError(this.translocoService.translate('group.settlementCancelError')),
      });
  }

  navigateToExpense(expense: ExpenseResponse) {
    this.router.navigate(['group', this.groupId, 'expense', expense.id]).then();
  }
}
