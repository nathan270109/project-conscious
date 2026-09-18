import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecaoHero } from './secao-hero';

describe('SecaoHero', () => {
  let component: SecaoHero;
  let fixture: ComponentFixture<SecaoHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecaoHero],
    }).compileComponents();

    fixture = TestBed.createComponent(SecaoHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
