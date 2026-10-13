import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="not-found">
      <p>ERRO 404</p>
      <h1>Esta página não existe.</h1>
      <span>O endereço pode estar incorreto ou a página pode ter sido movida.</span>
      <div>
        <a routerLink="/home">Voltar ao início</a>
        <a routerLink="/projects/new">Analisar um projeto</a>
      </div>
    </main>
  `,
  styles: `
    .not-found {
      display: grid;
      width: min(calc(100% - 40px), 900px);
      min-height: 78svh;
      margin: 0 auto;
      padding: calc(var(--header-height) + 72px) 0 80px;
      align-content: center;
      justify-items: start;
      color: var(--color-text);
    }
    .not-found p { margin: 0 0 18px; color: var(--color-accent); font-size: .72rem; font-weight: 750; letter-spacing: .14em; }
    .not-found h1 { max-width: 12ch; margin: 0 0 22px; font-family: var(--font-display); font-size: clamp(3.5rem, 10vw, 8rem); font-weight: 500; line-height: .9; letter-spacing: -.06em; }
    .not-found > span { display: block; max-width: 52ch; color: var(--color-text-muted); font-size: 1.05rem; line-height: 1.65; }
    .not-found div { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
    .not-found a { display: inline-flex; min-height: 48px; align-items: center; padding: 0 18px; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); color: var(--color-text); font-weight: 700; text-decoration: none; }
    .not-found a:last-child { border-color: var(--color-text); background: var(--color-text); color: #111116; }
    .not-found a:hover { border-color: var(--color-accent); }
    @media (max-width: 520px) { .not-found { width: min(calc(100% - 32px),900px); } .not-found div, .not-found a { width: 100%; } .not-found a { justify-content: center; } }
  `,
})
export class NotFound {}
