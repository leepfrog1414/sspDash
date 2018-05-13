import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SSPListComponent } from './sspList.component';

describe('SSPListComponent', () => {
  let component: SSPListComponent;
  let fixture: ComponentFixture<SSPListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SSPListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SSPListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
