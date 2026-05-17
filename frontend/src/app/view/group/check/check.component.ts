import { DatePipe } from '@angular/common';
import { Component, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CaishenAddExpenseModalComponent } from '../../../component/caishen-add-expense-modal/caishen-add-expense-modal.component';
import { NotificationsService } from '../../../service/notifications.service';
import { GroupStateService } from '../../../service/stateService/group.state.service';
import ExpenseRequest = CaiShen.ExpenseRequest;
import ExpenseResponse = CaiShen.ExpenseResponse;
import GroupResponse = CaiShen.GroupResponse;
import ExpenseHistoryResponse = CaiShen.ExpenseHistoryResponse;

@Component({
  selector: 'app-check',
  imports: [CaishenAddExpenseModalComponent, DatePipe, TranslocoPipe],
  templateUrl: './check.component.html',
  styleUrl: './check.component.css',
})
export class CheckComponent {
  protected readonly Math = Math;
  groupId!: number;
  groupInfo: Signal<GroupResponse | null>;
  expenseHistory: Signal<ExpenseHistoryResponse[]>;
  myBalance: Signal<number>;
  expenseForm: FormGroup;
  currentTab: WritableSignal<'expense' | 'balance' | 'history'> = signal('expense');

  constructor(
    private activateRoute: ActivatedRoute,
    private notificationsService: NotificationsService,
    private groupStateService: GroupStateService,
    private router: Router,
    private fb: FormBuilder,
    private translocoService: TranslocoService,
  ) {
    this.myBalance = this.groupStateService.selectMyBalance();
    this.expenseHistory = this.groupStateService.selectExpenseHistory();
    this.groupId = this.activateRoute.snapshot.params['id'];
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
    this.groupStateService.getGroupExpenseHistoryAction(this.groupId).pipe(take(1)).subscribe();
  }

  getHistoryTranslationKey(action: CaiShen.ExpenseHistoryAction) {
    return `expense.historyActions.${action}`;
  }

  getHistoryFieldTranslationKey(field: string) {
    return `expense.historyFields.${field}`;
  }

  navigateToExpense(expense: ExpenseResponse) {
    this.router.navigate(['group', this.groupId, 'expense', expense.id]).then();
  }
}
