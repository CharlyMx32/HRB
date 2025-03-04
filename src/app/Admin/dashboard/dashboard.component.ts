import { Component } from '@angular/core';
import { CardsComponent } from "../cards/cards.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [CardsComponent]
})
export class DashboardComponent {
}

