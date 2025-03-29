import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FacturasService } from '../../services/facturas.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacturasComponent implements OnInit {
  facturas$!: Observable<any[]>;

  constructor(private facturasService: FacturasService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.facturas$ = this.facturasService.facturas$;
  }

  sanitizarURL(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  verFactura(url: string): void {
    window.open(url, '_blank');
  }

  trackByFn(index: number, factura: any): string {
    return factura.URL; // Evita renders innecesarios en la lista
  }
}
