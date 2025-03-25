import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { FacturasComponent } from './facturas/facturas.component';
import { ProductosComponent } from './productos/productos.component';
import { EditarPerfilComponent } from '../usuario/editar-perfil/editar-perfil.component';

export const adminRoutes: Routes = [
    {
        path: '', // Ruta base del layout
        component: LayoutComponent, // Componente principal que contiene la sidebar
        children: [
            { path: 'home', component: DashboardComponent },
            { path: 'ordenes', component: OrdenesComponent },
            { path: 'registro', component: RegisterComponent },
            { path: 'facturas', component: FacturasComponent },
            { path: 'empleados', component: EmpleadosComponent },
            { path: 'productos', component: ProductosComponent },   
            { path: 'editar-perfil', component: EditarPerfilComponent },
                ]
    }
];
