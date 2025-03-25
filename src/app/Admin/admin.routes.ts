import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { ProductosComponent } from './productos/productos.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { FacturasComponent } from './facturas/facturas.component';

export const adminRoutes: Routes = [
    {
        path: '', 
        component: LayoutComponent,
        children: [
            { path: 'home', component: DashboardComponent },
            { path: 'ordenes', component: OrdenesComponent },
            { path: 'registro', component: RegisterComponent },
            { path: 'facturas', component: FacturasComponent },
            { path: 'empleados', component: EmpleadosComponent }
            
        ]
    }
];
