import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  statusMessage = '';

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.statusMessage =
      'A autenticação ainda não está disponível nesta versão. Use o diagnóstico público para explorar o produto.';
  }
}
