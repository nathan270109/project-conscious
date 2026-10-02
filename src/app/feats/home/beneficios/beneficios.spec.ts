import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Beneficios } from './beneficios';

describe('Beneficios', () => {
  let component: Beneficios;
  let fixture: ComponentFixture<Beneficios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Beneficios],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Beneficios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
