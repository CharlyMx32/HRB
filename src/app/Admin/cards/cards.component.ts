import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cards',
  imports: [],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {
  @Input() number!: string;  // Número de la tarjeta (Ej: "01.")
  @Input() title!: string;   // Título superior (Ej: "Lightning")
  @Input() description!: string; // Texto inferior (Ej: "Hover Me?")
  @Input() icon!: string;    // Nombre del ícono Font Awesome (Ej: "fa-temperature-half")
}
