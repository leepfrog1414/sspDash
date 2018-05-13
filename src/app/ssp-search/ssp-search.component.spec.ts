import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SSPSearchComponent } from './ssp-search.component';

describe('SSPSearchComponent', () => {
  let component: SSPSearchComponent;
  let fixture: ComponentFixture<SSPSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SSPSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SSPSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
