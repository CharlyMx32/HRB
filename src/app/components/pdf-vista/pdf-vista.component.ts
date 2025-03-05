import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';


@Component({
  selector: 'app-pdf-vista',
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-vista.component.html',
  styleUrls: ['./pdf-vista.component.css']
})
export class PdfVistaComponent implements OnInit {
  @ViewChild('pdfCanvas', { static: false }) pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
    pdfs = [
      { name: 'Factura 1', ordered: true, url: 'assets/pdf/FacturaSencilla.pdf', invoiceNumber: '', invoiceDate: '' },
      { name: 'Factura 2', ordered: false, url: 'assets/pdf/factura2.pdf', invoiceNumber: '', invoiceDate: '' }
    ];

  constructor() { }

  ngOnInit(): void {
    this.pdfs.forEach(pdf => {
      this.loadPdf(pdf.url, pdf);
    });
  }

  // Cargar el archivo PDF en cada canvas
  loadPdf(url: string, pdf: any): void {
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      pdf.pdfDoc = pdfDoc;  // Guardamos el documento PDF en la propiedad pdf
      this.renderPage(pdf, 1);  // Renderizamos la primera página del PDF
    });
  }

  renderPage(pdf: any, pageNum: number): void {
    const canvasRef = this.pdfCanvasRef.nativeElement.id === pdf.name ? this.pdfCanvasRef : null; // Encontramos el canvas correspondiente
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    pdf.pdfDoc.getPage(pageNum).then((page: any) => {
      const viewport = page.getViewport({ scale: 1 });
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
