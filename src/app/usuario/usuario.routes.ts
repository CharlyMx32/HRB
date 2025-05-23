import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditarPerfilUsuarioComponent } from './editar-perfil-usuario/editar-perfil-usuario.component';
import { LayoutComponent } from './layout/layout.component';
import { ProductosComponent } from '../Admin/productos/productos.component';
import { OrdenesUsuarioComponent } from './ordenes-usuario/ordenes-usuario.component';

export const UsuarioRoutes: Routes = [
     {
            path: '', 
            component: LayoutComponent, 
            children: [
                { path: 'dashboard', component: DashboardComponent },
                { path: 'ordenes', component: OrdenesUsuarioComponent }, 
                { path: 'productos', component: ProductosComponent },
                { path: 'editar-perfil', component: EditarPerfilUsuarioComponent }          
            ]
      }
];