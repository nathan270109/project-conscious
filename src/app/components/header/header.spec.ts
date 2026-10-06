import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mantém os links de início apontando para home', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.logo-link')?.getAttribute('href')).toBe('/home');
    expect(element.querySelector('.nav a')?.getAttribute('href')).toBe('/home');
    expect(element.querySelector('.sidebar-links a')?.getAttribute('href')).toBe('/home');
  });

  it('abre o menu e fecha pelo botão e pelo overlay', async () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.sidebar-menu.open')).toBeNull();
    element.querySelector<HTMLElement>('.fixed-right')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.sidebar-menu.open')).not.toBeNull();
    expect(element.querySelector('.overlay.open')).not.toBeNull();
    element.querySelector<HTMLButtonElement>('.close-btn')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.sidebar-menu.open')).toBeNull();
    element.querySelector<HTMLElement>('.fixed-right')!.click();
    await fixture.whenStable();
    element.querySelector<HTMLElement>('.overlay')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.sidebar-menu.open')).toBeNull();
    expect(element.querySelector('.overlay.open')).toBeNull();
  });

  it('informa expansão, impede foco no menu fechado e fecha com Escape', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('.fixed-right')!;
    const menu = element.querySelector<HTMLElement>('.sidebar-menu')!;
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });
});
