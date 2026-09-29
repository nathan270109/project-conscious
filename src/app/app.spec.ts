import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renderiza cabeçalho e rodapé ao redor da página inicial roteada', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(compiled.querySelector('app-header nav')?.textContent).toContain('Início');
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('app-home app-secao-hero')?.textContent).toContain('Seu software funciona.');
    expect(compiled.querySelector('app-footer')?.textContent).toContain('Project Conscious');
  });

  it('abre o formulário pelo link de análise da página inicial', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/home');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector<HTMLAnchorElement>('app-secao-hero a#repositorio');
    expect(link?.getAttribute('href')).toBe('/projects/new');
    link!.click();
    await fixture.whenStable();
    expect(router.url).toBe('/projects/new');
    expect(compiled.querySelector('app-project-form')).not.toBeNull();
    expect(compiled.querySelector('app-home')).toBeNull();
    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('app-footer')).not.toBeNull();
  });
});
