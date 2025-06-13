import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

// Importa tus componentes/páginas hijas (standalone) que vivirán dentro del layout
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LicenciasComponent } from './pages/licencias/licencias.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { TipoCertificadoComponent } from './pages/tipo-certificado/tipo-certificado.component';
import { EjecutivoComponent } from './pages/ejecutivo/ejecutivo.component';
import {CertificadoComponent} from './pages/certificado/certificado.component';

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
      },
      {
        path: 'proyectos',
        component: ProyectosComponent
      },
      {
        path: 'certificados',
        component: CertificadoComponent
      },
      {
        path: 'tipo-certificado',
        component: TipoCertificadoComponent
      },
      {
        path: 'ejecutivo',
        component: EjecutivoComponent
      }
    ]
  },

  // Si no existe la ruta, lo mandas a login
  { path: '**', redirectTo: 'login' }
];
