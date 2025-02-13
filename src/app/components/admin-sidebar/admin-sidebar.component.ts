import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';


@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {
  isCollapsed = true;
  menuItems = [
    { label: 'Dashboard', icon: 'fas fa-home' },
    { label: 'Messages', icon: 'fas fa-envelope' },
    { label: 'Analytics', icon: 'fas fa-chart-line' },
    { label: 'Calendar', icon: 'fas fa-calendar-alt' },
    { label: 'User', icon: 'fas fa-user' },
    { label: 'File Manager', icon: 'fas fa-folder' },
    { label: 'Settings', icon: 'fas fa-cog' }
  ];

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
  
  
}
