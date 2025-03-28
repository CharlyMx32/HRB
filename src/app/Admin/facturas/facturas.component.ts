import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FacturasService } from '../../services/facturas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css'],
  imports: [CommonModule]
})
export class FacturasComponent implements OnInit {
  facturas: any[] = [];

  constructor(private facturasService: FacturasService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // Obtener facturas desde la API y reemplazar la lista actual
    this.facturasService.getFacturas().subscribe(data => {
      this.facturas = data;
    });

    // Suscribirse al WebSocket sin duplicar facturas
    this.facturasService.facturas$.subscribe(nuevasFacturas => {
      nuevasFacturas.forEach(nuevaFactura => {
        if (!this.facturas.some(factura => factura.URL === nuevaFactura.URL)) {
          this.facturas = [...this.facturas, nuevaFactura];
        }
      });
    });
  }

  sanitizarURL(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}