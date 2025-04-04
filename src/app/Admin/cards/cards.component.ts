import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cards',
  imports: [],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {
  @Input() number!: string;  
  @Input() title!: string;  
  @Input() description!: string; 
  @Input() icon!: string;  
}
