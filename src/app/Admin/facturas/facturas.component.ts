import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FacturasService } from '../../services/facturas.service';
import { DeliveriesService } from '../../services/deliveries.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FacturasComponent implements OnInit {
  facturas: any[] = [];
  selectedFactura: any = null;
  workerId: string = '';
  carrier: string = '';
  showModal: boolean = false;

  constructor(
    private facturasService: FacturasService,
    private deliveriesService: DeliveriesService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}


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

  iniciarOrden(factura: any): void {
    this.selectedFactura = factura;
    this.showModal = true;
  }

  confirmarEntrega(): void {
    if (!this.workerId || !this.carrier) {
      alert('Debe ingresar todos los datos.');
      return;
    }

    const deliveryData = {
      invoice_id: this.selectedFactura.id,
      worker_id: this.workerId,
      carrier: this.carrier
    };

    this.deliveriesService.makeDelivery(deliveryData).subscribe(
      response => {
        alert('Entrega creada con éxito');
        this.showModal = false;
        this.workerId = '';
        this.carrier = '';
        this.router.navigate(['/admin/ordenes']);
      },
      error => {
        alert('Error al crear la entrega');
      }
    );
  }

  cerrarModal(): void {
    this.showModal = false;
    this.workerId = '';
    this.carrier = '';
  }
}
