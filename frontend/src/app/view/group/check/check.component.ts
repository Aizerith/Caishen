import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupStateService } from '../../../service/stateService/group.state.service';
import { Observable, take, tap } from 'rxjs';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { NotificationsService } from '../../../service/notifications.service';
import { environment } from '../../../../environments/environment';
import { CaishenAddExpenseModalComponent } from '../../../component/caishen-add-expense-modal/caishen-add-expense-modal.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import GroupResponse = CaiShen.GroupResponse;
import ExpenseRequest = CaiShen.ExpenseRequest;

import { ProfileStateService } from '../../../service/stateService/profile.state.service';
import ExpenseResponse = CaiShen.ExpenseResponse;

@Component({
  selector: 'app-check',
  imports: [NgIf, AsyncPipe, CaishenAddExpenseModalComponent, NgForOf, NgClass, NgSwitch, NgSwitchCase, DatePipe],
  templateUrl: './check.component.html',
  styleUrl: './check.component.css',
})
export class CheckComponent {
  protected readonly Math = Math;
  groupId!: number;
  groupInfo$: Observable<GroupResponse> = new Observable();
  myBalance$: Observable<number> = new Observable();
  expenseForm: FormGroup;
  currentTab: 'expense' | 'balance' = 'expense';
  userId!: number;

  constructor(
    private activateRoute: ActivatedRoute,
    private notificationsService: NotificationsService,
    private groupStateService: GroupStateService,
    private profileStateService: ProfileStateService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.profileStateService
      .selectProfileState()
      .pipe(
        tap((value) => {
          this.userId = value.info!.id;
        }),
        take(1),
      )
      .subscribe();
    this.myBalance$ = this.groupStateService.selectMyBalance();
    this.groupId = this.activateRoute.snapshot.params['id'];
    this.groupInfo$ = this.groupStateService.selectGroupInfo();
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
      .then((_) => this.notificationsService.showSuccess("Lien d'invitation copié dans le presse papier"));
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
    this.notificationsService.showSuccess('Ajout de la dépense ' + '"' + this.expenseForm.get('title')?.value + '"');
    this.groupStateService
      .addExpense(this.getExpenseRequestFromForm())
      .pipe(take(1))
      .subscribe({
        next: (_) => {
          this.notificationsService.showSuccess(
            'Ajout de la dépense ' + '"' + this.expenseForm.get('title')?.value + '"',
          );
          this.expenseForm.reset();
        },
        error: (_) =>
          this.notificationsService.showError(
            "Erreur lors de l'ajout de la dépense " + '"' + this.expenseForm.get('title')?.value + '"',
          ),
      });
  }

  changeTabToExpense() {
    this.currentTab = 'expense';
  }

  changeTabToBalance() {
    this.currentTab = 'balance';
  }

  navigateToExpense(expense: ExpenseResponse) {
    this.router.navigate(['group', 'expense', expense.id]).then();
  }
}
