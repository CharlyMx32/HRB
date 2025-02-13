import { Routes } from '@angular/router';
import { UsuarioRoutes } from './usuario/usuario.routes';
import { LoginComponent } from './auth/login/login.component';
import { adminRoutes } from './Admin/admin.routes';

export const routes: Routes = [
    { path: 'worker', children: UsuarioRoutes },  
    { path: 'admin', children:  adminRoutes},
    {path: 'login', component: LoginComponent},
    {path:'**', redirectTo: '/login'}
];
