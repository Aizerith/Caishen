import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { CaishenCustomFormInputComponent } from './caishen-custom-form-input.component';

describe('CaishenCustomFormInputComponent', () => {
  let component: CaishenCustomFormInputComponent;
  let fixture: ComponentFixture<CaishenCustomFormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaishenCustomFormInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaishenCustomFormInputComponent);
    component = fixture.componentInstance;
    component.inputForm = new FormControl('', { nonNullable: true });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
