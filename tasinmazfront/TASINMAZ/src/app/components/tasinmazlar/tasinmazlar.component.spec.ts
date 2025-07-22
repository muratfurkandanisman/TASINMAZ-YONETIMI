import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasinmazlarComponent } from './tasinmazlar.component';

describe('TasinmazlarComponent', () => {
  let component: TasinmazlarComponent;
  let fixture: ComponentFixture<TasinmazlarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasinmazlarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasinmazlarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
