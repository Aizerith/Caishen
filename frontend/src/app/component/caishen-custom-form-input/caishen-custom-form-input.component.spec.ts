import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
