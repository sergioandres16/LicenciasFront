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
import { MatNativeDateModule } from '@angular/material/core';

import { TipoCertificadoService, TipoCertificado, CreateTipoCertificadoRequest, UpdateTipoCertificadoRequest } from '../../services/tipo-certificado.service';
import Swal from 'sweetalert2';

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
}
