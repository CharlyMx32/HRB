import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FacturasService } from '../../services/facturas.service';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent {
  facturas: any[] = [];

  constructor(private facturasService: FacturasService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.facturasService.getFacturas().subscribe(data => {
      this.facturas = data;
    });
  }

  sanitizarURL(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onButtonClick() {
  }
}