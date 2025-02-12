import { Routes } from '@angular/router';
import { UsuarioRoutes } from './usuario/usuario.routes';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
    { path: 'usuario', children: UsuarioRoutes },  
    {path: 'login', component: LoginComponent},
    {path:'**', redirectTo: '/login'}
];
