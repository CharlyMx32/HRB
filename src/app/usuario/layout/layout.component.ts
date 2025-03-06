import { Component } from '@angular/core';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../../components/top-bar/top-bar.component";

@Component({
  selector: 'app-layout',
  imports: [UserSidebarComponent, RouterModule, CommonModule, TopBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
