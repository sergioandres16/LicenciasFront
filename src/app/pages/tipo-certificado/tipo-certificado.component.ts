import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter, DateAdapter } from '@angular/material/core';

import { TipoCertificadoService, TipoCertificado, CreateTipoCertificadoRequest, UpdateTipoCertificadoRequest } from '../../services/tipo-certificado.service';
import Swal from 'sweetalert2';

// Formato de fecha personalizado para DD/MM/YYYY
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Adaptador personalizado para formato DD/MM/YYYY
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return super.format(date, displayFormat);
  }
}

@Component({
  selector: 'app-tipo-certificado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './tipo-certificado.component.html',
  styleUrls: ['./tipo-certificado.component.scss']
})
export class TipoCertificadoComponent implements OnInit {

  @ViewChild('tipoCertificadoDialog') tipoCertificadoDialog!: TemplateRef<any>;

  tiposCertificado: TipoCertificado[] = [];
  displayedColumns: string[] = ['id', 'nombreCertificado', 'abreviatura', 'fechaCreacion', 'acciones'];

  // Paginación
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Búsqueda
  searchNombre = '';
  searchAbreviatura = '';
  searchFechaInicio: Date | null = null;
  searchFechaFin: Date | null = null;

  // Formulario
  tipoCertificadoForm!: FormGroup;
  isEditing = false;
  currentTipoCertificadoId?: number;

  constructor(
    private tipoCertificadoService: TipoCertificadoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadTiposCertificado();
  }

  createForm(): void {
    this.tipoCertificadoForm = this.fb.group({
      nombreCertificado: ['', [Validators.required, Validators.maxLength(255)]],
      abreviatura: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  loadTiposCertificado(): void {
    this.tipoCertificadoService.getTiposCertificado(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.tiposCertificado = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error al cargar tipos de certificado:', error);
          Swal.fire('Error', 'No se pudieron cargar los tipos de certificado', 'error');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTiposCertificado();
  }

  buscar(): void {
    // Resetear a la primera página cuando se hace una búsqueda
    this.currentPage = 0;

    if (this.searchNombre || this.searchAbreviatura || this.searchFechaInicio || this.searchFechaFin) {
      // Formatear fechas si existen
      const fechaInicioStr = this.searchFechaInicio ? this.formatDateForSearch(this.searchFechaInicio) : undefined;
      const fechaFinStr = this.searchFechaFin ? this.formatDateForSearch(this.searchFechaFin) : undefined;

      this.tipoCertificadoService.searchTiposCertificadoConFechas(
        this.searchNombre,
        this.searchAbreviatura,
        fechaInicioStr,
        fechaFinStr,
        this.currentPage,
        this.pageSize
      ).subscribe({
        next: (response) => {
          this.tiposCertificado = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error en la búsqueda:', error);
          Swal.fire('Error', 'Error al buscar tipos de certificado', 'error');
        }
      });
    } else {
      this.loadTiposCertificado();
    }
  }

  limpiarBusqueda(): void {
    this.searchNombre = '';
    this.searchAbreviatura = '';
    this.searchFechaInicio = null;
    this.searchFechaFin = null;
    this.loadTiposCertificado();
  }

  formatDateForSearch(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDialog(tipoCertificado?: TipoCertificado): void {
    this.isEditing = !!tipoCertificado;
    this.currentTipoCertificadoId = tipoCertificado?.id;

    if (tipoCertificado) {
      this.tipoCertificadoForm.patchValue({
        nombreCertificado: tipoCertificado.nombreCertificado,
        abreviatura: tipoCertificado.abreviatura
      });
    } else {
      this.tipoCertificadoForm.reset();
    }

    this.dialog.open(this.tipoCertificadoDialog, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.tipoCertificadoForm.reset();
    this.isEditing = false;
    this.currentTipoCertificadoId = undefined;
  }

  onSubmit(): void {
    if (this.tipoCertificadoForm.invalid) {
      Object.keys(this.tipoCertificadoForm.controls).forEach(key => {
        this.tipoCertificadoForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.tipoCertificadoForm.value;

    if (this.isEditing && this.currentTipoCertificadoId) {
      const updateRequest: UpdateTipoCertificadoRequest = {
        nombreCertificado: formValue.nombreCertificado,
        abreviatura: formValue.abreviatura
      };

      this.tipoCertificadoService.updateTipoCertificado(this.currentTipoCertificadoId, updateRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Tipo de certificado actualizado correctamente', 'success');
            this.closeDialog();
            this.loadTiposCertificado();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            Swal.fire('Error', error.error?.message || 'Error al actualizar el tipo de certificado', 'error');
          }
        });
    } else {
      const createRequest: CreateTipoCertificadoRequest = {
        nombreCertificado: formValue.nombreCertificado,
        abreviatura: formValue.abreviatura
      };

      this.tipoCertificadoService.createTipoCertificado(createRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Tipo de certificado creado correctamente', 'success');
            this.closeDialog();
            this.loadTiposCertificado();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            Swal.fire('Error', error.error?.message || 'Error al crear el tipo de certificado', 'error');
          }
        });
    }
  }

  deleteTipoCertificado(tipoCertificado: TipoCertificado): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el tipo de certificado ${tipoCertificado.nombreCertificado}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && tipoCertificado.id) {
        this.tipoCertificadoService.deleteTipoCertificado(tipoCertificado.id)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'El tipo de certificado ha sido eliminado', 'success');
              this.loadTiposCertificado();
            },
            error: (error) => {
              console.error('Error al eliminar:', error);
              Swal.fire('Error', 'No se pudo eliminar el tipo de certificado', 'error');
            }
          });
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  descargarExcel(): void {
    const fechaInicioStr = this.searchFechaInicio ? this.formatDateForSearch(this.searchFechaInicio) : undefined;
    const fechaFinStr = this.searchFechaFin ? this.formatDateForSearch(this.searchFechaFin) : undefined;

    this.tipoCertificadoService.descargarExcel(
      this.searchNombre || undefined,
      this.searchAbreviatura || undefined,
      fechaInicioStr,
      fechaFinStr
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `tipos_certificado_${new Date().toISOString().slice(0,10)}.xlsx`;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.fire('Éxito', 'Excel descargado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al descargar Excel:', error);
        Swal.fire('Error', 'No se pudo descargar el archivo Excel', 'error');
      }
    });
  }

  descargarPdf(): void {
    const fechaInicioStr = this.searchFechaInicio ? this.formatDateForSearch(this.searchFechaInicio) : undefined;
    const fechaFinStr = this.searchFechaFin ? this.formatDateForSearch(this.searchFechaFin) : undefined;

    this.tipoCertificadoService.descargarPdf(
      this.searchNombre || undefined,
      this.searchAbreviatura || undefined,
      fechaInicioStr,
      fechaFinStr
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `tipos_certificado_${new Date().toISOString().slice(0,10)}.pdf`;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.fire('Éxito', 'PDF descargado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al descargar PDF:', error);
        Swal.fire('Error', 'No se pudo descargar el archivo PDF', 'error');
      }
    });
  }
}
