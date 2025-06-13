import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  toggled = false;

  constructor() {}

  toggle() {
    this.toggled = !this.toggled;
  }

  getSidebarState() {
    return this.toggled;
  }

  setSidebarState(state: boolean) {
    this.toggled = state;
  }

  getMenuList() {
    return [
      {
        title: 'SISTEMA DE LICENCIAS',
        type: 'header'
      },
      {
        title: 'Principal',
        icon: 'assets/img/sistema.gif',
        active: false,
        type: 'dropdown',
        badge: {
          class: 'badge-warning',
        },
        submenus: [
          {
            title: 'Inicio',
            badge: {
              class: 'badge-success'
            },
            icon: 'assets/img/icon_home.gif',
            url: 'home'
          }
        ]
      },
      {
        title: 'Administración',
        icon: 'assets/img/icon_reporte.gif',
        active: false,
        type: 'dropdown',
        badge: {
          class: 'badge-info'
        },
        submenus: [
          {
            title: 'Tipo Certificado',
            icon: 'assets/img/certificado.png',
            url: 'tipo-certificado'
          },
          {
            title: 'Ejecutivo',
            icon: 'assets/img/ejecutivo.png',
            url: 'ejecutivo'
          }
        ]
      },
      {
        title: 'Gestión',
        icon: 'assets/img/administracion.gif',
        active: false,
        type: 'dropdown',
        badge: {
          class: 'badge-danger'
        },
        submenus: [
          {
            title: 'Gestionar Licencias',
            icon: 'assets/img/tarjeta-de-membresia.png',
            url: 'licencias'
          },
          {
            title: 'Gestionar Proyectos',
            icon: 'assets/img/gestion-del-tiempo.png',
            url: 'proyectos'
          },
          {
            title: 'Gestionar Certificados',
            icon: 'assets/img/certificado-adm.png',
            url: 'certificados'
          }
        ]
      },
      {
        title: 'Cerrar',
        icon: 'fa-solid fa-right-from-bracket',
        active: false,
        codigo: 'tcSalir',
        type: 'dropdown',
        badge: {
          class: 'badge-success'
        },
        submenus: [
          {
            title: 'Cerrar Sesión',
            icon2: 'fa-solid fa-power-off',
            codigo: 'csSalir'
          }
        ]
      }
    ];
  }
}
