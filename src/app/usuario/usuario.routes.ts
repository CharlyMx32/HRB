import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';

export const UsuarioRoutes: Routes = [
     {
            path: '', 
            component: LayoutComponent, 
            children: [
                { path: 'dashboard', component: DashboardComponent },            
            ]
      }
];