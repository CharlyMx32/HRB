import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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
  }
}
