import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza marca e links de navegação', () => {
    const element = fixture.nativeElement as HTMLElement;
    const brand = element.querySelector('.footer-brand');
    expect(brand?.textContent).toContain('Project Conscious');
    expect(brand?.querySelector('a')?.getAttribute('href')).toBe('/home');
    expect(brand?.querySelector('img')?.getAttribute('src')).toBe('/assets/logo-white.png');
    expect(brand?.querySelector('img')?.getAttribute('alt')).toBeTruthy();
    const links = Array.from(element.querySelectorAll('nav[aria-label="Navegação do footer"] a'));
    expect(links.map(link => link.textContent?.trim())).toEqual(['Início', 'Sobre', 'Contato', 'Diagnóstico', 'Login']);
    expect(links[0].getAttribute('href')).toBe('#top');
    expect(links[3].getAttribute('href')).toMatch(/^\/projects\/new\/?$/);
    expect(links[4].getAttribute('href')).toBe('/login');
    const sections = element.querySelectorAll('nav[aria-label="Seções home"] a');
    expect(Array.from(sections).map(link => link.getAttribute('href'))).toEqual([
      '#section-hero', '#section-sobre-o-projeto', '#section-como-funciona',
      '#section-cinco-dimensoes', '#section-beneficios', '#section-faq',
    ]);
  });
});
