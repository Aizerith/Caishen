import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CaishenCustomFormInputComponent } from '../caishen-custom-form-input/caishen-custom-form-input.component';
import GroupMemberResponse = CaiShen.GroupMemberResponse;
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-caishen-add-expense-modal',
  imports: [CaishenCustomFormInputComponent, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './caishen-add-expense-modal.component.html',
  styleUrl: './caishen-add-expense-modal.component.css',
})
export class CaishenAddExpenseModalComponent {
  @ViewChild('expenseModal') modalRef!: ElementRef<HTMLDialogElement>;
  @Input({ required: true }) expenseForm!: FormGroup;
  @Input({ required: true }) memberList!: GroupMemberResponse[];
  @Output() onValidateExpense: EventEmitter<void> = new EventEmitter();

  getFormFromName(name: string) {
    return this.expenseForm.get(name) as FormControl;
  }

  onValidate() {
    if (this.expenseForm.invalid || !this.getFormFromName('participants').value.length) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.modalRef.nativeElement.close();
    this.onValidateExpense.emit();
  }

  closeModal() {
    this.modalRef.nativeElement.close();
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const selectedClothing = this.expenseForm.get('participants') as FormArray;

    if (checkbox.checked) {
      selectedClothing.push(new FormControl(checkbox.value));
    } else {
      const index = selectedClothing.controls.findIndex((control) => control.value == checkbox.value);
      selectedClothing.removeAt(index);
    }
  }

  isChecked(id: number) {
    return (this.expenseForm.get('participants')?.value as number[]).some((value) => value == id);
  }
}
