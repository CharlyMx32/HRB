import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  pdfs: any[] = []; // Lista de PDFs obtenidos desde el backend
  selectedPdf: any = null; // PDF seleccionado

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchInvoices(); // Cargar facturas al iniciar
  }

  fetchInvoices(): void {
    this.http.get<any[]>('http://192.168.252.81:8000/api/invoices')
      .subscribe(response => {
        console.log('JSON recibido:', response);
        this.pdfs = response; // Guardamos los PDFs
      }, error => {
        console.error('Error en la petición:', error);
      });
  }


  selectPdf(pdf: any): void {
    this.selectedPdf = pdf;
    this.loadPdf(pdf.URL);
  
    setTimeout(() => {
      document.querySelector('canvas')?.scrollIntoView({ behavior: 'smooth' });
    }, 500); // Espera un poco para asegurarse de que el PDF se renderiza
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
      const viewport = page.getViewport({ scale: 0.5 }); // Reducir tamaño
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
