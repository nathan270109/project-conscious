import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('não apresenta links vazios e explica que autenticação ainda não está disponível', async () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('a')).toBeNull();
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'autenticação ainda não está disponível',
    );
  });
});
