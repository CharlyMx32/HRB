import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent implements OnInit {

  isCollapsed = true;
  newInvoicesCount = 0;

  hasNewOrders = false;

  menuItems = [
    { label: 'Dashboard', icon: 'fas fa-home', route: '/admin/home' },
    { label: 'Ordenes', icon: 'fas fa-file-invoice', route: '/admin/ordenes' },
    { label: 'Registro trabajadores', icon: 'fas fa-user', route: '/admin/empleados' },
    { label: 'Productos', icon: 'fas fa-box', route: '/admin/productos' },
    { label: 'Dispositivos', icon: 'fas fa-mobile-alt', route: '/admin/dispositivos' },
    { label: 'Configuración', icon: 'fas fa-cog', route: '/admin/editar-perfil' },
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    private notificationService: NotificationService // Añade el servicio
  ) { }

  ngOnInit() {
    this.notificationService.currentInvoicesCount.subscribe(count => {
      this.newInvoicesCount = count;
    });
    
    this.notificationService.hasNewOrders$.subscribe(hasNew => {
      this.hasNewOrders = hasNew;
    });
  }

  navigateTo(route: string): void {
    if (route === '/admin/ordenes') {
      this.notificationService.resetInvoicesCount();
    }
    this.router.navigate([route]);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed) {
      setTimeout(() => {
        anime({
          targets: '.sidebar li span',
          opacity: [0, 1],
          translateX: [-30, 0],
          duration: 500,
          easing: 'easeOutQuad',
          delay: anime.stagger(100),
          begin: () => {
            document.querySelectorAll('.sidebar li span').forEach(el => {
              el.classList.remove('invisible');
            });
          }
        });
      }, 100);
    } else {
      document.querySelectorAll('.sidebar li span').forEach(el => {
        el.classList.add('invisible');
      });
    }
  }

  logout() {
    this.authService.logout();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100); // Espera 100ms antes de redirigir
  }

}
