import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

@Component({
  selector: 'app-pdf-vista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-vista.component.html',
  styleUrls: ['./pdf-vista.component.css']
})
export class PdfVistaComponent implements OnInit {
  @ViewChild('pdfCanvas', { static: false }) pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfPreviewCanvas', { static: false }) pdfPreviewCanvasRef!: ElementRef<HTMLCanvasElement>;

  pdfs: any[] = [];
  selectedPdf: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  fetchInvoices(): void {
    this.http.get('http://192.168.252.81:8000/api/invoices')
      .subscribe({
        next: (response) => {
          console.log('Facturas recibidas:', response);
          this.pdfs = response as any[];
          console.log('Datos en pdfs:', this.pdfs); // Verifica aquí si realmente hay datos.
        },
        error: (err) => {
          console.error('Error en la petición:', err);
          alert('Hubo un problema al cargar las facturas.');
        }
      });
  }
  

  selectPdf(pdf: any): void {
    console.log('Seleccionando factura:', pdf); // Verifica que se está llamando correctamente
    this.selectedPdf = pdf;
    this.loadPdf(pdf.URL);
  }
  

  deselectPdf(): void {
    this.selectedPdf = null;
  }

  loadPdf(url: string): void {
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      this.renderPage(pdfDoc, 1);
    });
  }

  renderPage(pdfDoc: any, pageNum: number): void {
    if (!this.pdfCanvasRef) return;

    const canvas = this.pdfCanvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    pdfDoc.getPage(pageNum).then((page: any) => {
      const viewport = page.getViewport({ scale: 0.8 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);
    });
  }
}
