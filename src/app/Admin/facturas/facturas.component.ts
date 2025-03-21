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
    this.facturasService.getFacturas().subscribe(data => {
      this.facturas = data;
    });

    this.facturasService.facturas$.subscribe(data => {
      this.facturas = data;
    });
  }

  sanitizarURL(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
