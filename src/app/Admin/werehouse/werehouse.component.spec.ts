import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WerehouseComponent } from './werehouse.component';

describe('WerehouseComponent', () => {
  let component: WerehouseComponent;
  let fixture: ComponentFixture<WerehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WerehouseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WerehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
