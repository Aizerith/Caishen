import { Component } from '@angular/core';
import { CaishenCustomFormInputComponent } from '../../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupHttpService } from '../../../service/http/group.http.service';
import GroupInfoRequest = CaiShen.GroupInfoRequest;
import { NotificationsService } from '../../../service/notifications.service';
import { Router } from '@angular/router';
import { ProfileStateService } from '../../../service/state/profile.state.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-group-create',
  imports: [CaishenCustomFormInputComponent, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class GroupCreateComponent {
  groupForm: FormGroup;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private groupHttpService: GroupHttpService,
    private profileStateService: ProfileStateService,
    private notification: NotificationsService,
    private router: Router,
    private translocoService: TranslocoService,
  ) {
    this.groupForm = this.fb.group({
      title: new FormControl<string>('', [Validators.required]),
      members: this.fb.array([]),
    });
    this.userId = this.profileStateService.getMyId();
  }

  public getFormFromName(name: string) {
    return this.groupForm.get(name) as FormControl;
  }

  createGroup() {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    if (!this.userId) {
      this.notification.showError(this.translocoService.translate('groups.createWithoutUser'));
      return;
    }

    const data: GroupInfoRequest = {
      title: this.groupForm.get('title')?.value,
      members: [this.userId],
    };
    this.groupHttpService.addGroup(data).subscribe({
      next: (value) => {
        this.notification.showSuccess(this.translocoService.translate('groups.created', { title: data.title }));
        this.router.navigate(['group']).then();
        this.profileStateService.updateGroup(value);
      },
      error: (_) => this.notification.showError(this.translocoService.translate('groups.createError', { title: data.title })),
    });
  }
}
