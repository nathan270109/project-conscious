import { Component } from '@angular/core';
import { SecaoHero } from './secao-hero/secao-hero';

@Component({
  imports: [SecaoHero],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
