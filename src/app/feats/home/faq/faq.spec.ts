import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Faq } from './faq';

describe('Faq', () => {
  let component: Faq;
  let fixture: ComponentFixture<Faq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faq],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Faq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra as perguntas e configura o botão para o formulário de análise', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('details summary').length).toBe(4);
    expect(element.textContent).toContain('O que o Project Conscious analisa?');
    const button = fixture.debugElement.query(By.css('button#link'));
    expect(button.nativeElement.textContent).toContain('Analisar repositório');
    const link = button.injector.get(RouterLink);
    expect(link.urlTree).not.toBeNull();
    expect(TestBed.inject(Router).serializeUrl(link.urlTree!)).toBe('/projects/new');
  });
});
