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
});
