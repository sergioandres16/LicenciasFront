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

import { EjecutivoService, Ejecutivo, CreateEjecutivoRequest, UpdateEjecutivoRequest } from '../../services/ejecutivo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ejecutivo',
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
  templateUrl: './ejecutivo.component.html',
  styleUrls: ['./ejecutivo.component.scss']
})
export class EjecutivoComponent implements OnInit {

  @ViewChild('ejecutivoDialog') ejecutivoDialog!: TemplateRef<any>;

  ejecutivos: Ejecutivo[] = [];
  displayedColumns: string[] = ['id', 'nombreEjecutivo', 'abreviatura', 'estado', 'fechaCreacion', 'acciones'];

  // Paginación
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Búsqueda
  searchNombre = '';
  searchAbreviatura = '';
  searchEstado = '';
  searchFechaInicio: Date | null = null;
  searchFechaFin: Date | null = null;

  // Formulario
  ejecutivoForm!: FormGroup;
  isEditing = false;
  currentEjecutivoId?: number;

  constructor(
    private ejecutivoService: EjecutivoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadEjecutivos();
  }

  createForm(): void {
    this.ejecutivoForm = this.fb.group({
      nombreEjecutivo: ['', [Validators.required, Validators.maxLength(255)]],
      abreviatura: ['', [Validators.required, Validators.maxLength(50)]],
      estado: ['1', [Validators.required, Validators.pattern('^[01]$')]]
    });
  }

  loadEjecutivos(): void {
    this.ejecutivoService.getEjecutivos(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.ejecutivos = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error al cargar ejecutivos:', error);
          Swal.fire('Error', 'No se pudieron cargar los ejecutivos', 'error');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEjecutivos();
  }

  buscar(): void {
    // Formatear fechas si existen
    const fechaInicioStr = this.searchFechaInicio ? this.formatDateForSearch(this.searchFechaInicio) : undefined;
    const fechaFinStr = this.searchFechaFin ? this.formatDateForSearch(this.searchFechaFin) : undefined;

    this.ejecutivoService.searchEjecutivosConFechas(
      this.searchNombre || undefined,
      this.searchAbreviatura || undefined,
      this.searchEstado || undefined,
      fechaInicioStr,
      fechaFinStr,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.ejecutivos = response.content;
        this.totalElements = response.totalElements;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        Swal.fire('Error', 'Error al buscar ejecutivos', 'error');
      }
    });
  }

  limpiarBusqueda(): void {
    this.searchNombre = '';
    this.searchAbreviatura = '';
    this.searchEstado = '';
    this.searchFechaInicio = null;
    this.searchFechaFin = null;
    this.loadEjecutivos();
  }

  formatDateForSearch(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDialog(ejecutivo?: Ejecutivo): void {
    this.isEditing = !!ejecutivo;
    this.currentEjecutivoId = ejecutivo?.id;

    if (ejecutivo) {
      this.ejecutivoForm.patchValue({
        nombreEjecutivo: ejecutivo.nombreEjecutivo,
        abreviatura: ejecutivo.abreviatura,
        estado: ejecutivo.estado
      });
    } else {
      this.ejecutivoForm.reset({
        estado: '1'
      });
    }

    this.dialog.open(this.ejecutivoDialog, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.ejecutivoForm.reset();
    this.isEditing = false;
    this.currentEjecutivoId = undefined;
  }

  onSubmit(): void {
    if (this.ejecutivoForm.invalid) {
      Object.keys(this.ejecutivoForm.controls).forEach(key => {
        this.ejecutivoForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.ejecutivoForm.value;

    if (this.isEditing && this.currentEjecutivoId) {
      const updateRequest: UpdateEjecutivoRequest = {
        nombreEjecutivo: formValue.nombreEjecutivo,
        abreviatura: formValue.abreviatura,
        estado: formValue.estado
      };

      this.ejecutivoService.updateEjecutivo(this.currentEjecutivoId, updateRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Ejecutivo actualizado correctamente', 'success');
            this.closeDialog();
            this.loadEjecutivos();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            Swal.fire('Error', error.error?.message || 'Error al actualizar el ejecutivo', 'error');
          }
        });
    } else {
      const createRequest: CreateEjecutivoRequest = {
        nombreEjecutivo: formValue.nombreEjecutivo,
        abreviatura: formValue.abreviatura,
        estado: formValue.estado
      };

      this.ejecutivoService.createEjecutivo(createRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Ejecutivo creado correctamente', 'success');
            this.closeDialog();
            this.loadEjecutivos();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            Swal.fire('Error', error.error?.message || 'Error al crear el ejecutivo', 'error');
          }
        });
    }
  }

  deleteEjecutivo(ejecutivo: Ejecutivo): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el ejecutivo ${ejecutivo.nombreEjecutivo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && ejecutivo.id) {
        this.ejecutivoService.deleteEjecutivo(ejecutivo.id)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'El ejecutivo ha sido eliminado', 'success');
              this.loadEjecutivos();
            },
            error: (error) => {
              console.error('Error al eliminar:', error);
              Swal.fire('Error', 'No se pudo eliminar el ejecutivo', 'error');
            }
          });
      }
    });
  }

  getEstadoLabel(estado: string): string {
    return estado === '1' ? 'Activo' : 'Inactivo';
  }

  getEstadoClass(estado: string): string {
    return estado === '1' ? 'estado-activo' : 'estado-inactivo';
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
