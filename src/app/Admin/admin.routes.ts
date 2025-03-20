import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { PdfVistaComponent } from '../components/pdf-vista/pdf-vista.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { ProductosComponent } from './productos/productos.component';

export const adminRoutes: Routes = [
    {
        path: '', // Ruta base del layout
        component: LayoutComponent, // Componente principal que contiene la sidebar
        children: [
            { path: 'home', component: DashboardComponent },
            { path: 'ordenes', component: OrdenesComponent },
            { path: 'registro', component: RegisterComponent },
            { path: 'empleados', component: EmpleadosComponent },
            { path: 'facturas', component: PdfVistaComponent },
            { path: 'productos', component: ProductosComponent }
        ]
    }
];
