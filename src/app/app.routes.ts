import { Routes } from '@angular/router';
import { UsuarioRoutes } from './usuario/usuario.routes';
import { LoginComponent } from './auth/login/login.component';
import { adminRoutes } from './Admin/admin.routes';
import { AuthGuard } from './guards/auth.guard';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';

export const routes: Routes = [
    { path: 'usuario', children: UsuarioRoutes, canActivate: [AuthGuard] },  
    { path: 'admin', children: adminRoutes, canActivate: [AuthGuard] },
    { path: 'forget-password', component: ForgetPasswordComponent },
    { path: 'login', component: LoginComponent },    
    { path: '**', redirectTo: '/login' }
];

