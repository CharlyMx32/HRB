import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { WorkersService } from '../../services/workers.service';

@Component({
  selector: 'app-ordenes-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes-usuario.component.html',
  styleUrls: ['./ordenes-usuario.component.css']
})
export class OrdenesUsuarioComponent implements OnInit, OnDestroy {
  ordenes: any[] = [];
  private pollingSubscription!: Subscription;
  private readonly POLLING_INTERVAL = 15000; // 15 segundos

  searchOrden: string = '';
  searchEstado: string = '';
  
  currentPage: number = 1;
  itemsPerPage: number = 5;

  // Variables para el modal
  showModal: boolean = false;
  ordenSeleccionada: any = null;
  codigoTransportista: string = '';
  mensajeModal: string = '';
  isError: boolean = false;
  isLoading: boolean = false; 

  constructor(private workersService: WorkersService) {}

  ngOnInit() {
    this.loadOrdenes();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => this.workersService.getWorkerOrders())
      )
      .subscribe({
        next: (ordenes: any[]) => {
          this.ordenes = ordenes;
        },
        error: (error) => {
          console.error('Error al obtener las órdenes', error);
          this.ordenes = [];
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadOrdenes() {
    this.workersService.getWorkerOrders().subscribe({
      next: (ordenes: any[]) => {
        this.ordenes = ordenes;
      },
      error: (error) => {
        console.error('Error al obtener las órdenes', error);
        this.ordenes = [];
      }
    });
  }

  abrirModalCompletar(orden: any) {
    this.ordenSeleccionada = orden;
    this.codigoTransportista = '';
    this.showModal = true;
    this.mensajeModal = '';
    this.isError = false;
  }

  cerrarModal() {
    this.showModal = false;
    this.ordenSeleccionada = null;
    this.codigoTransportista = '';
    this.mensajeModal = '';
    this.isError = false;
  }

  confirmarCompletar() {
    if (!this.codigoTransportista) {
      this.mensajeModal = 'Por favor ingresa el código del transportista';
      this.isError = true;
      return;
    }
  
    this.isLoading = true; // Activar estado de carga
  
    this.workersService.markOrderAsCompleted(this.ordenSeleccionada.invoice_id, this.codigoTransportista)
      .subscribe({
        next: () => {
          this.mensajeModal = '¡Orden completada con éxito!';
          this.isError = false;
          this.isLoading = false; // Desactivar carga
          
          setTimeout(() => {
            const orden = this.ordenes.find(o => o.invoice_id === this.ordenSeleccionada.invoice_id);
            if (orden) orden.status = 'Completed';
            this.cerrarModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al marcar como completada', error);
          this.mensajeModal = 'Error al completar la orden. Verifica el código del transportista.';
          this.isError = true;
          this.isLoading = false; // Desactivar carga en caso de error
        }
      });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pending': 
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Completed': 
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: 
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  parseProductos(productsString: string): any[] {
    return productsString.split(', ').map(item => {
      const [nombre, peso] = item.split(': ');
      return {
        nombre: nombre.trim(),
        peso: parseFloat(peso.replace('g', ''))
      };
    });
  }

  getEstadoTraducido(estado: string): string {
    const traducciones: { [key: string]: string } = {
      Pending: 'Pendiente',
      Completed: 'Completado',
      Canceled: 'Cancelado'
    };
    return traducciones[estado] || estado;
  }

  get ordenesFiltradas(): any[] {
    return this.ordenes.filter(orden =>
      orden.invoice_id.toString().includes(this.searchOrden) &&
      (this.searchEstado ? orden.status === this.searchEstado : true)
    );
  }
  
  get ordenesPaginadas(): any[] {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.ordenesFiltradas.slice(inicio, fin);
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.ordenesFiltradas.length / this.itemsPerPage);
  }
}