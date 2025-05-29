import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

// Importa tus componentes/páginas hijas (standalone) que vivirán dentro del layout
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LicenciasComponent } from './pages/licencias/licencias.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },   // Fuera del layout
  { path: 'register', component: RegisterComponent }, // Fuera del layout

  {
    path: 'inicio',
    component: LayoutComponent,    // El "Skeleton"
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'licencias',
        component: LicenciasComponent
      }
    ]
  },

  // Si no existe la ruta, lo mandas a login
  { path: '**', redirectTo: 'login' }
];
