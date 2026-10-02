import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Faq } from './faq';

describe('Faq', () => {
  let component: Faq;
  let fixture: ComponentFixture<Faq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faq],
    }).compileComponents();

    fixture = TestBed.createComponent(Faq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra as quatro perguntas com respostas explicativas', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('details summary').length).toBe(4);
    expect(element.textContent).toContain('O que o Project Conscious analisa?');
    const cards = Array.from(element.querySelectorAll('details'));
    expect(cards.map(card => card.querySelector('summary span')?.textContent?.trim())).toEqual([
      'O que o Project Conscious analisa?',
      'Preciso conectar o GitHub para usar?',
      'Como o Conscious Score é calculado?',
      'E se eu não quiser seguir depois?',
    ]);
    for (const card of cards) {
      expect(card.querySelector('.resposta')?.textContent?.trim().length).toBeGreaterThan(0);
    }
    expect(cards[2].querySelector('.resposta')?.textContent).toContain('0 a 100');
  });
});
