import { Routes } from '@angular/router';
import { Home } from './feats/home/home';
import { ProjectForm } from './feats/projects/project-form/project-form';

export const routes: Routes = [

    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'home', component: Home},
    { path: 'projects/new', component: ProjectForm}

];
