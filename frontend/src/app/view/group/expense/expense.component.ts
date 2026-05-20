import { Component, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, switchMap, take } from 'rxjs';
import { ExpenseStateService } from '../../../service/state/expense.state.service';
import ExpenseInfoResponse = CaiShen.ExpenseInfoResponse;
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { GroupStateService } from '../../../service/state/group.state.service';
import { CaishenAddExpenseModalComponent } from '../../../component/caishen-add-expense-modal/caishen-add-expense-modal.component';
import { NotificationsService } from '../../../service/notifications.service';
import GroupResponse = CaiShen.GroupResponse;
import ExpenseRequest = CaiShen.ExpenseRequest;
import { NavigationService } from '../../../service/navigation.service';

@Component({
  selector: 'app-expense',
  imports: [CaishenAddExpenseModalComponent, DatePipe, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

  readonly expenseStateService: ExpenseStateService = inject(ExpenseStateService);
  readonly groupStateService: GroupStateService = inject(GroupStateService);
  readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly fb: FormBuilder = inject(FormBuilder);
  readonly notificationsService: NotificationsService = inject(NotificationsService);
  readonly translocoService: TranslocoService = inject(TranslocoService);
  readonly navigationService: NavigationService = inject(NavigationService);

  protected expenseInfo: Signal<ExpenseInfoResponse | null> = this.expenseStateService.selectExpenseInfo();
  protected groupInfo: Signal<GroupResponse | null> = this.groupStateService.selectGroupInfo();
  protected editExpenseForm: FormGroup = this.fb.group({
    title: new FormControl<string>('', [Validators.required]),
    amount: new FormControl<string>('', [Validators.required]),
    payerId: new FormControl<number | undefined>(undefined, [Validators.required]),
    expenseDate: new FormControl<string>('', [Validators.required]),
    participants: this.fb.array([]),
  });

  private readonly groupId = Number(this.activatedRoute.snapshot.params['groupId']);
  private readonly expenseId = Number(this.activatedRoute.snapshot.params['expenseId'] ?? this.activatedRoute.snapshot.params['id']);

  constructor() {
    forkJoin([
      this.expenseStateService.getExpenseInfoAction(this.expenseId).pipe(take(1)),
      this.groupStateService.getGroupInfoAction(this.groupId).pipe(take(1)),
    ]).subscribe(() => this.fillEditExpenseForm());
  }

  updateExpense() {
    if (this.editExpenseForm.invalid || !this.getFormFromName('participants').value.length) {
      this.editExpenseForm.markAllAsTouched();
      return;
    }

    this.groupStateService
      .updateExpense(this.expenseId, this.getExpenseRequestFromForm())
      .pipe(
        switchMap(() => this.expenseStateService.getExpenseInfoAction(this.expenseId)),
        take(1),
      )
      .subscribe({
        next: () => this.notificationsService.showSuccess(this.translocoService.translate('expense.updated')),
        error: () => this.notificationsService.showError(this.translocoService.translate('expense.updateError')),
      });
  }

  deleteExpense() {
    this.groupStateService
      .deleteExpense(this.expenseId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationsService.showSuccess(this.translocoService.translate('expense.deleted'));
          this.navigationService.replaceCurrentRoute(`/group/${this.groupId}`);
        },
        error: () => this.notificationsService.showError(this.translocoService.translate('expense.deleteError')),
      });
  }

  openDeleteModal() {
    this.deleteModal.nativeElement.showModal();
  }

  closeDeleteModal() {
    this.deleteModal.nativeElement.close();
  }

  private fillEditExpenseForm() {
    const group = this.groupInfo();
    const expense = group?.expenseList.find((item) => item.id === this.expenseId);

    if (!expense || !group) {
      return;
    }

    const payer = group.memberList.find((member) => member.name === expense.payerName);
    const participants = this.editExpenseForm.get('participants') as FormArray;
    participants.clear();
    expense.participant
      .split(' ')
      .filter(Boolean)
      .forEach((participantId) => participants.push(new FormControl(participantId)));

    this.editExpenseForm.patchValue({
      title: expense.title,
      amount: expense.amount,
      payerId: payer?.id,
      expenseDate: this.toDateInputValue(expense.expenseDate),
    });
  }

  private getExpenseRequestFromForm(): ExpenseRequest {
    return {
      groupId: this.groupId,
      expenseDate: this.editExpenseForm.get('expenseDate')?.value,
      title: this.editExpenseForm.get('title')?.value,
      amount: this.editExpenseForm.get('amount')?.value,
      payerId: this.editExpenseForm.get('payerId')?.value,
      participant: (this.editExpenseForm.get('participants')?.value as string[]).join(' ').trim(),
    };
  }

  private getFormFromName(name: string) {
    return this.editExpenseForm.get(name) as FormControl;
  }

  private toDateInputValue(value: Date): string {
    return String(value).slice(0, 10);
  }
}
