import { Routes } from '@angular/router';
import { UsuarioRoutes } from './usuario/usuario.routes';
import { LoginComponent } from './auth/login/login.component';
import { adminRoutes } from './Admin/admin.routes';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'usuario', children: UsuarioRoutes, canActivate: [AuthGuard] },  
    { path: 'admin', children: adminRoutes, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: '/login' }
];

