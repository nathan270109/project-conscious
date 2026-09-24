import { Component } from '@angular/core';
import { SecaoHero } from './secao-hero/secao-hero';
import { SobreOProjeto } from './sobre-o-projeto/sobre-o-projeto';
import { ComoFunciona } from './como-funciona/como-funciona';

@Component({
  imports: [SecaoHero, SobreOProjeto, ComoFunciona],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
