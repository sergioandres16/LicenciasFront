import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenciaService } from '../../services/licencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-licencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.scss']
})
export class LicenciasComponent implements OnInit {

  macAddress: string = '';
  empresa: string = '';
  aplicacion: string = '';
  isLoading: boolean = false;
  validationResult: any = null;

  constructor(private licenciaService: LicenciaService) {}

  ngOnInit(): void {}

  validarLicencia(): void {
    if (!this.macAddress.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor ingrese una dirección MAC válida',
        confirmButtonText: 'Entendido',
        timer: 3000
      });
      return;
    }

    this.isLoading = true;
    this.validationResult = null;

    const request = {
      mac: this.macAddress.trim(),
      empresa: this.empresa.trim(),
      aplicacion: this.aplicacion.trim()
    };

    this.licenciaService.validarLicencia(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.validationResult = response;

        if (response.valido) {
          Swal.fire({
            icon: 'success',
            title: 'Licencia Válida',
            text: response.mensaje,
            confirmButtonText: 'Excelente',
            timer: 3000
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Licencia Inválida',
            text: response.mensaje,
            confirmButtonText: 'Entendido',
            timer: 3000
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error completo validando licencia:', error);

        let errorMessage = 'Error al validar la licencia. Inténtelo nuevamente.';

        // Manejar diferentes tipos de errores
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.mensaje) {
            errorMessage = error.error.mensaje;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.mac) {
            errorMessage = error.error.mac;
          } else {
            // Si el error es un objeto con múltiples campos
            const errorFields = Object.keys(error.error);
            if (errorFields.length > 0) {
              errorMessage = error.error[errorFields[0]];
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Verificar errores específicos
        if (error.status === 400) {
          errorMessage = errorMessage || 'Datos inválidos para la validación.';
        } else if (error.status === 401) {
          errorMessage = 'No autorizado. Por favor inicie sesión nuevamente.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error de Validación',
          text: errorMessage,
          confirmButtonText: 'Entendido',
          timer: 5000
        });
      }
    });
  }

  limpiarFormulario(): void {
    this.macAddress = '';
    this.empresa = '';
    this.aplicacion = '';
    this.validationResult = null;
  }

  formatMac(event: any): void {
    let value = event.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');

    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    // Agregar guiones cada 2 caracteres
    let formatted = '';
    for (let i = 0; i < value.length; i += 2) {
      if (i > 0) formatted += '-';
      formatted += value.substring(i, i + 2);
    }

    this.macAddress = formatted;
  }
}
