import { Component } from '@angular/core';
import { SecaoHero } from './secao-hero/secao-hero';
import { SobreOProjeto } from './sobre-o-projeto/sobre-o-projeto';
import { ComoFunciona } from './como-funciona/como-funciona';
import { CincoDimensoes } from './cinco-dimensoes/cinco-dimensoes';
import { Faq } from './faq/faq';

@Component({
  imports: [SecaoHero, SobreOProjeto, ComoFunciona, CincoDimensoes, Faq],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
