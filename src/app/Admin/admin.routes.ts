import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component'
import { WerehouseComponent } from './werehouse/werehouse.component';
import { RegisterComponent } from './register/register.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

export const adminRoutes: Routes = [
    { path: 'home', component: LayoutComponent },
    { path: 'almacen', component: WerehouseComponent},
    { path: 'registro', component: RegisterComponent},
    { path: 'configuracion', component: ConfiguracionComponent}
];