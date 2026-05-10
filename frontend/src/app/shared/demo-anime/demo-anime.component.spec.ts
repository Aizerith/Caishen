import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoAnimeComponent } from './demo-anime.component';

describe('DemoAnimeComponent', () => {
  let component: DemoAnimeComponent;
  let fixture: ComponentFixture<DemoAnimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoAnimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoAnimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
