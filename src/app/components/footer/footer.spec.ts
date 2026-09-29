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
    const brand = element.querySelector('.brand-logo');
    expect(brand?.textContent).toContain('Project Conscious');
    expect(brand?.getAttribute('href')).toBe('/');
    const links = element.querySelectorAll('nav[aria-label="Navegação principal"] a');
    expect(Array.from(links).map(link => link.getAttribute('href'))).toEqual(['/home', '/home']);
  });
});
