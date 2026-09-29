import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza as cinco seções e o link para análise', () => {
    const element = fixture.nativeElement as HTMLElement;
    for (const selector of [
      'app-secao-hero', 'app-sobre-o-projeto', 'app-como-funciona', 'app-cinco-dimensoes', 'app-faq'
    ]) {
      expect(element.querySelector(selector)).not.toBeNull();
    }
    expect(element.querySelector('a#repositorio')?.getAttribute('href')).toBe('/projects/new');
  });
});
