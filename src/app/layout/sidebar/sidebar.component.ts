import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import Swal from 'sweetalert2';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgScrollbarModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slide', [
      state('up', style({ height: 0 })),
      state('down', style({ height: '*' })),
      transition('up <=> down', animate(200))
    ])
  ]
})
export class SidebarComponent implements OnInit {
  menus: any[] = [];
  nombres: string | null = '';
  correo: string | null = '';

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.nombres = sessionStorage.getItem('usuario');
    this.correo = sessionStorage.getItem('correo');
    this.menus = this.sidebarService.getMenuList();
  }

  getSideBarState(): boolean {
    return this.sidebarService.getSidebarState();
  }

  toggle(currentMenu: any) {
    if (currentMenu.type === 'dropdown') {
      this.menus.forEach(menu => {
        if (menu === currentMenu) {
          menu.active = !menu.active;
        } else {
          menu.active = false;
        }
      });
    }
  }

  getState(currentMenu: any) {
    return currentMenu.active ? 'down' : 'up';
  }

  toggleSidebar(): void {
    this.sidebarService.setSidebarState(!this.sidebarService.getSidebarState());
  }

  cerrarSidebar(): void {
    this.sidebarService.toggle();
  }

  cerrarSession(e: any): void {
    Swal.fire({
      title: '¿Desea cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión!'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        this.mensaje();
      }
    });
  }

  mensaje(): void {
    Swal.fire({
      icon: 'success',
      title: 'Sesión Cerrada',
      text: 'Vuelva pronto'
    }).then(() => {
      this.router.navigate(['/']);
    });
  }
}
