import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatorPanel } from './validator-panel';

describe('ValidatorPanel', () => {
  let component: ValidatorPanel;
  let fixture: ComponentFixture<ValidatorPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatorPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidatorPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
