import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';
import { LayoutComponent } from './layout/layout.component';
import { ProductosComponent } from '../Admin/productos/productos.component';
import { OrdenesComponent } from '../Admin/ordenes/ordenes.component';

export const UsuarioRoutes: Routes = [
     {
            path: '', 
            component: LayoutComponent, 
            children: [
                { path: 'dashboard', component: DashboardComponent },
                { path: 'ordenes', component: OrdenesComponent }, 
                { path: 'productos', component: ProductosComponent },
                { path: 'editar-perfil', component: EditarPerfilComponent }          
            ]
      }
];