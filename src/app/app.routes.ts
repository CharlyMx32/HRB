import { Routes } from '@angular/router';
import { UsuarioRoutes } from './usuario/usuario.routes';

export const routes: Routes = [
    { path: 'usuario', children: UsuarioRoutes },
    
];
