import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SecaoHero } from './secao-hero';

describe('SecaoHero', () => {
  let component: SecaoHero;
  let fixture: ComponentFixture<SecaoHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecaoHero],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SecaoHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('apresenta a proposta do projeto e o link para analisar repositório', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toContain('Seu software funciona.');
    const link = element.querySelector('a#repositorio');
    expect(link?.textContent).toContain('Analisar repositório');
    expect(link?.getAttribute('href')).toBe('/projects/new');
  });
});
