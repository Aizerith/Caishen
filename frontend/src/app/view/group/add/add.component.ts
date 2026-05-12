import { Component } from '@angular/core';
import { CaishenCustomFormInputComponent } from '../../../component/caishen-custom-form-input/caishen-custom-form-input.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GroupHttpService } from '../../../service/httpService/group.http.service';
import GroupInfoRequest = CaiShen.GroupInfoRequest;
import { NotificationsService } from '../../../service/notifications.service';
import { Router } from '@angular/router';
import { ProfileStateService } from '../../../service/stateService/profile.state.service';

@Component({
  selector: 'app-add',
  imports: [CaishenCustomFormInputComponent],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css',
})
export class AddComponent {
  groupForm: FormGroup;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private groupHttpService: GroupHttpService,
    private profileStateService: ProfileStateService,
    private notification: NotificationsService,
    private router: Router,
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

  addNewGroup() {
    if (!this.userId) {
      this.notification.showError("Impossible de crÃ©er le groupe sans utilisateur connectÃ©");
      return;
    }

    const data: GroupInfoRequest = {
      title: this.groupForm.get('title')?.value,
      members: [this.userId],
    };
    this.groupHttpService.addGroup(data).subscribe({
      next: (value) => {
        this.notification.showSuccess(`Le groupe ${data.title} à été ajouté`);
        this.router.navigate(['group']).then();
        this.profileStateService.updateGroup(value);
      },
      error: (_) => this.notification.showError(`Erreur lors de la création du groupe ${data.title}`),
    });
  }
}
