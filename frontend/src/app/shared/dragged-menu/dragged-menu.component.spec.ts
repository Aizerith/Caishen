import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggedMenuComponent } from './dragged-menu.component';

describe('DraggedMenuComponent', () => {
  let component: DraggedMenuComponent;
  let fixture: ComponentFixture<DraggedMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggedMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraggedMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
