import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  fecha: string = '';

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.updateFecha();
    setInterval(() => {
      this.updateFecha();
    }, 1000);
  }

  private updateFecha(): void {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    const hours = String(ahora.getHours()).padStart(2, '0');
    const minutes = String(ahora.getMinutes()).padStart(2, '0');
    const seconds = String(ahora.getSeconds()).padStart(2, '0');

    this.fecha = `${year}-${month}-${day} - ${hours}:${minutes}:${seconds}`;
  }

  getClasses(): {} {
    return {};
  }

  toggleSidebar(): void {
    this.sidebarService.setSidebarState(!this.sidebarService.getSidebarState());
  }

  getSideBarState(): boolean {
    return this.sidebarService.getSidebarState();
  }
}
