import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheChatterComponent } from './the-chatter.component';

describe('TheChatterComponent', () => {
  let component: TheChatterComponent;
  let fixture: ComponentFixture<TheChatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheChatterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TheChatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
