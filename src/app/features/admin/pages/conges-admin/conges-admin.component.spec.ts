import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CongesAdminComponent } from './conges-admin.component';

describe('CongesAdminComponent', () => {
  let component: CongesAdminComponent;
  let fixture: ComponentFixture<CongesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CongesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CongesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
