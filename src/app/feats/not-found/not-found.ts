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
      width: min(100% - 40px, 760px);
      min-height: 70vh;
      margin: 0 auto;
      padding: 140px 0 80px;
      color: #0f2747;
    }
    .not-found p { margin: 0 0 12px; color: #9a6c08; font-weight: 800; letter-spacing: .12em; }
    .not-found h1 { margin: 0 0 18px; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1; }
    .not-found span { display: block; max-width: 52ch; color: #53677c; font-size: 1.1rem; line-height: 1.6; }
    .not-found div { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
    .not-found a { padding: 12px 18px; border: 1px solid #0f2747; border-radius: 999px; color: #0f2747; font-weight: 700; text-decoration: none; }
    .not-found a:last-child { background: #0f2747; color: #fff; }
    .not-found a:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
  `,
})
export class NotFound {}
