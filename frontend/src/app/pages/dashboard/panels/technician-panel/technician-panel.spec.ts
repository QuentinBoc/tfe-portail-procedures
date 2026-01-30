import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianPanel } from './technician-panel';

describe('TechnicianPanel', () => {
  let component: TechnicianPanel;
  let fixture: ComponentFixture<TechnicianPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicianPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
