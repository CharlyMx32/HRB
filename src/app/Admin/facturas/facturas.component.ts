import { Component } from '@angular/core';
import { PdfVistaComponent } from "../../components/pdf-vista/pdf-vista.component";

@Component({
  selector: 'app-facturas',
  imports: [PdfVistaComponent],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent {

}
