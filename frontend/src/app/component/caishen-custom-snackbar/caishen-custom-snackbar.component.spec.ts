import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaishenCustomSnackbarComponent } from './caishen-custom-snackbar.component';

describe('CaishenCustomSnackbarComponent', () => {
  let component: CaishenCustomSnackbarComponent;
  let fixture: ComponentFixture<CaishenCustomSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaishenCustomSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaishenCustomSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
