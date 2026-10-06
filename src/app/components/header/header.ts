import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  // Estado para controlar se o menu está aberto ou fechado
  isMenuOpen = signal<boolean>(false);
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');

  toggleMenu(): void {
    this.isMenuOpen.update(state => !state);
  }

  closeMenu(): void {
    const wasOpen = this.isMenuOpen();
    this.isMenuOpen.set(false);
    if (wasOpen) this.menuToggle()?.nativeElement.focus();
  }
}
