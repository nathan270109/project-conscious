import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CincoDimensoes } from './cinco-dimensoes';

describe('CincoDimensoes', () => {
  let component: CincoDimensoes;
  let fixture: ComponentFixture<CincoDimensoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CincoDimensoes],
    }).compileComponents();

    fixture = TestBed.createComponent(CincoDimensoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
