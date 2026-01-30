import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterPanel } from './requester-panel';

describe('RequesterPanel', () => {
  let component: RequesterPanel;
  let fixture: ComponentFixture<RequesterPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
