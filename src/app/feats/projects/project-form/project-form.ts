import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { NgForm } from '@angular/forms';

type ProjectDraft = {
  name: string;
  repositoryUrl: string;
  description: string;
};

@Component({
  imports: [FormsModule],
  selector: 'app-project-form',
  styleUrl: './project-form.css',
  templateUrl: './project-form.html',
})
export class ProjectForm {
  project: ProjectDraft = {
    name: '',
    repositoryUrl: '',
    description: '',
  };

  submitted = false;

// onSubmit: função que será chamada quando o formulário for enviado.
  onSubmit(form: NgForm): void {
    this.submitted = true;
// submitted: informa se a pessoa tentou enviar o formulário.

    if (form.invalid) {
      return;
    }
// form.invalid: impede o próximo passo enquanto campos obrigatórios estiverem inválidos.
  }
}
