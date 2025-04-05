import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-eliminar-cuadro',
  standalone: true,
  imports: [],
  templateUrl: './eliminar-cuadro.component.html',
  styleUrls: ['./eliminar-cuadro.component.css']
})
export class EliminarCuadroComponent {
  constructor(
    public dialogRef: MatDialogRef<EliminarCuadroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      titulo?: string;
      mensaje: string;
      textoConfirmar?: string;
      textoCancelar?: string;
    }
  ) {
    // Valores por defecto
    this.data.titulo = this.data.titulo || 'Confirmar eliminación';
    this.data.textoConfirmar = this.data.textoConfirmar || 'Eliminar';
    this.data.textoCancelar = this.data.textoCancelar || 'Cancelar';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}