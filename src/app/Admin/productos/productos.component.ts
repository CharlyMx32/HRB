import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  products: any[] = [];
  showForm: boolean = false;
  productForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private productsService: ProductosService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      stock_weight: ['', [Validators.required, Validators.min(0)]],
      exit_code: ['', [Validators.required, Validators.maxLength(255)]],
      image: ['', [Validators.required, Validators.maxLength(255)]],
      area: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.getProducts();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  
    // Limpiar los mensajes de error y éxito al abrir o cerrar el formulario
    this.errorMessage = '';
    this.successMessage = '';
  
    // Opcional: Reiniciar el formulario al abrir el formulario
    if (this.showForm) {
      this.productForm.reset();
    }
  }
  
  getProducts(): void {
    console.log('Fetching products...');
    this.productsService.getProducts().subscribe(
      data => {
        console.log('Data received from API:', data);
        this.products = data;
        console.log('Products:', this.products);
      },
      error => {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Error fetching products. Please try again later.';
      }
    );
  }

  register(): void {
    if (this.productForm.invalid) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }

    const productData = this.productForm.value;

    this.productsService.registerProduct(productData).subscribe(
      response => {
        console.log('Producto registrado:', response);
        this.successMessage = 'Registro exitoso. Redirigiendo...';
        this.errorMessage = '';

        // Limpiar el formulario después del registro
        this.productForm.reset();

        // Ocultar el formulario después del registro
        this.toggleForm();

        // Recargar la página después de 2 segundos
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        console.error('Error registrando producto:', error);
        this.errorMessage = 'Error registrando producto. Por favor, inténtelo de nuevo.';
        this.successMessage = '';
      }
    );
  }
}