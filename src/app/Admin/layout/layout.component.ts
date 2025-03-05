import { Component } from '@angular/core';
import { AdminSidebarComponent } from "../../components/admin-sidebar/admin-sidebar.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../../components/top-bar/top-bar.component";

@Component({
  selector: 'app-layout',
  imports: [AdminSidebarComponent, RouterModule, CommonModule, TopBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
