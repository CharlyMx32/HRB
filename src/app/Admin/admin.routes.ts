import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { WerehouseComponent } from './werehouse/werehouse.component';
import { RegisterComponent } from './register/register.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const adminRoutes: Routes = [
    {
        path: '', // Ruta base del layout
        component: LayoutComponent, // Componente principal que contiene la sidebar
        children: [
            { path: 'home', component: DashboardComponent },
            { path: 'almacen', component: WerehouseComponent },
            { path: 'registro', component: RegisterComponent },
            { path: 'configuracion', component: ConfiguracionComponent }
        ]
    }
];
