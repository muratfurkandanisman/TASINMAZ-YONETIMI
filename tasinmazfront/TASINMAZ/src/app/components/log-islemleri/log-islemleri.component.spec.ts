import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogIslemleriComponent } from './log-islemleri.component';

describe('LogIslemleriComponent', () => {
  let component: LogIslemleriComponent;
  let fixture: ComponentFixture<LogIslemleriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogIslemleriComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogIslemleriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
