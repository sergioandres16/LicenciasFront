import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
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

import { LicenciaManagementService, Licencia, CreateLicenciaRequest, UpdateLicenciaRequest } from '../../services/licencia-management.service';
import { EjecutivoService, Ejecutivo } from '../../services/ejecutivo.service';
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
  selector: 'app-licencias',
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
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.scss']
})
export class LicenciasComponent implements OnInit, OnDestroy {

  @ViewChild('licenciaDialog') licenciaDialog!: TemplateRef<any>;

  licencias: Licencia[] = [];
  displayedColumns: string[] = ['id', 'empresa', 'mac', 'estado', 'fechaCreacion', 'vigencia', 'diasRestantes', 'acciones'];

  // Paginación
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Búsqueda
  searchEmpresa = '';
  searchMac = '';
  searchEstado = '';
  searchFechaCreacion: Date | null = null;

  // Formulario
  licenciaForm!: FormGroup;
  isEditing = false;
  currentLicenciaId?: number;

  // Timer para actualizar tiempo restante
  updateTimer: any;

  // Opciones de vigencia
  vigenciaUnidades = [
    { value: 'horas', label: 'Horas' },
    { value: 'dias', label: 'Días' },
    { value: 'semanas', label: 'Semanas' },
    { value: 'meses', label: 'Meses' },
    { value: 'anos', label: 'Años' }
  ];

  vigenciaValores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ejecutivos: Ejecutivo[] = [];

  constructor(
    private licenciaService: LicenciaManagementService,
    private ejecutivoService: EjecutivoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadLicencias();
    this.loadEjecutivos();
    // Actualizar cada 30 segundos para refrescar el tiempo restante más frecuentemente
    this.updateTimer = setInterval(() => {
      this.loadLicencias();
    }, 30000); // 30 segundos
  }

  ngOnDestroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  createForm(): void {
    this.licenciaForm = this.fb.group({
      empresa: ['', [Validators.required]],
      mac: ['', [Validators.required, Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)]],
      estado: ['1', [Validators.required]],
      observacion: [''],
      ejecutivoId: [null, [Validators.required]],
      vigenciaValor: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      vigenciaUnidad: ['dias', [Validators.required]]
    });
  }

  loadLicencias(): void {
    this.licenciaService.getLicencias(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.licencias = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error al cargar licencias:', error);
          Swal.fire('Error', 'No se pudieron cargar las licencias', 'error');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLicencias();
  }

  buscar(): void {
    // Resetear a la primera página cuando se hace una búsqueda
    this.currentPage = 0;

    if (this.searchEmpresa || this.searchMac || this.searchEstado || this.searchFechaCreacion) {
      // Formatear fecha si existe (se envía como fechaInicio para que busque ese día específico)
      const fechaCreacionStr = this.searchFechaCreacion ? this.formatDateForSearch(this.searchFechaCreacion) : undefined;

      this.licenciaService.searchLicenciasConFechas(
        this.searchEmpresa,
        this.searchMac,
        this.searchEstado,
        fechaCreacionStr,
        undefined, // fechaFin no se usa
        this.currentPage,
        this.pageSize
      ).subscribe({
        next: (response) => {
          this.licencias = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error en la búsqueda:', error);
          Swal.fire('Error', 'Error al buscar licencias', 'error');
        }
      });
    } else {
      this.loadLicencias();
    }
  }

  limpiarBusqueda(): void {
    this.searchEmpresa = '';
    this.searchMac = '';
    this.searchEstado = '';
    this.searchFechaCreacion = null;
    this.loadLicencias();
  }

  formatDateForSearch(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDialog(licencia?: Licencia): void {
    this.isEditing = !!licencia;
    this.currentLicenciaId = licencia?.id;

    if (licencia) {
      // Calcular vigencia original para edición
      let vigenciaValor = 1;
      let vigenciaUnidad = 'dias';

      if (licencia.vigencia) {
        const match = licencia.vigencia.match(/(\d+)\s*(hora|día|dia|semana|mes|mese|año|ano)s?/i);
        if (match) {
          vigenciaValor = parseInt(match[1]);
          const unidad = match[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          if (unidad.includes('hora')) {
            vigenciaUnidad = 'horas';
          } else if (unidad.includes('dia')) {
            vigenciaUnidad = 'dias';
          } else if (unidad.includes('semana')) {
            vigenciaUnidad = 'semanas';
          } else if (unidad.includes('mes')) {
            vigenciaUnidad = 'meses';
          } else if (unidad.includes('ano')) {
            vigenciaUnidad = 'anos';
          }
        }
      }

      this.licenciaForm.patchValue({
        empresa: licencia.empresa,
        mac: licencia.mac,
        estado: licencia.estado,
        observacion: licencia.observacion || '',
        ejecutivoId: licencia.ejecutivoId,
        vigenciaValor: Math.min(vigenciaValor, 10),
        vigenciaUnidad: vigenciaUnidad
      });
    } else {
      this.licenciaForm.reset({
        estado: '1',
        vigenciaValor: 1,
        vigenciaUnidad: 'dias',
        ejecutivoId: null
      });
    }

    this.dialog.open(this.licenciaDialog, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.licenciaForm.reset();
    this.isEditing = false;
    this.currentLicenciaId = undefined;
  }

  onSubmit(): void {
    if (this.licenciaForm.invalid) {
      Object.keys(this.licenciaForm.controls).forEach(key => {
        this.licenciaForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.licenciaForm.value;

    if (this.isEditing && this.currentLicenciaId) {
      const updateRequest: UpdateLicenciaRequest = {
        empresa: formValue.empresa,
        mac: formValue.mac,
        estado: formValue.estado,
        observacion: formValue.observacion,
        ejecutivoId: formValue.ejecutivoId,
        vigenciaValor: formValue.vigenciaValor,
        vigenciaUnidad: formValue.vigenciaUnidad
      };

      this.licenciaService.updateLicencia(this.currentLicenciaId, updateRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Licencia actualizada correctamente', 'success');
            this.closeDialog();
            this.loadLicencias();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            Swal.fire('Error', error.error?.message || 'Error al actualizar la licencia', 'error');
          }
        });
    } else {
      const createRequest: CreateLicenciaRequest = {
        empresa: formValue.empresa,
        mac: formValue.mac,
        estado: formValue.estado,
        observacion: formValue.observacion,
        ejecutivoId: formValue.ejecutivoId,
        vigenciaValor: formValue.vigenciaValor,
        vigenciaUnidad: formValue.vigenciaUnidad
      };

      this.licenciaService.createLicencia(createRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Licencia creada correctamente', 'success');
            this.closeDialog();
            this.loadLicencias();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            Swal.fire('Error', error.error?.message || 'Error al crear la licencia', 'error');
          }
        });
    }
  }

  deleteLicencia(licencia: Licencia): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar la licencia de ${licencia.empresa}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && licencia.id) {
        this.licenciaService.deleteLicencia(licencia.id)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'La licencia ha sido eliminada', 'success');
              this.loadLicencias();
            },
            error: (error) => {
              console.error('Error al eliminar:', error);
              Swal.fire('Error', 'No se pudo eliminar la licencia', 'error');
            }
          });
      }
    });
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

    this.licenciaForm.patchValue({ mac: formatted });
  }

  getEstadoLabel(estado: string): string {
    return estado === '1' ? 'Activo' : 'Inactivo';
  }

  getEstadoClass(licencia: Licencia): string {
    if (licencia.vencido) return 'estado-vencido';
    return licencia.activo ? 'estado-activo' : 'estado-inactivo';
  }

  getVigenciaInfo(licencia: Licencia): string {
    return licencia.vigencia || 'Sin vigencia';
  }

  getDiasRestantesInfo(licencia: Licencia): string {
    // Si está inactivo, mostrar mensaje específico
    if (licencia.estado === '0' || !licencia.activo) {
      return 'Sin tiempo restante';
    }

    if (!licencia.tiempoRestante) {
      return 'Sin tiempo restante';
    }

    const tiempo = licencia.tiempoRestante;

    // Si ya venció
    if (tiempo.totalMinutos < 0) {
      const minutosVencidos = Math.abs(tiempo.totalMinutos);
      const diasVencidos = Math.floor(minutosVencidos / (24 * 60));
      const horasVencidas = Math.floor((minutosVencidos % (24 * 60)) / 60);
      const minsVencidos = minutosVencidos % 60;

      if (diasVencidos > 0) {
        return `Vencido hace ${diasVencidos} día${diasVencidos > 1 ? 's' : ''}`;
      } else if (horasVencidas > 0) {
        return `Vencido hace ${horasVencidas} hora${horasVencidas > 1 ? 's' : ''}`;
      } else {
        return `Vencido hace ${minsVencidos} minuto${minsVencidos > 1 ? 's' : ''}`;
      }
    }

    // Si tiene tiempo restante
    if (tiempo.dias > 0) {
      return `${tiempo.dias} día${tiempo.dias > 1 ? 's' : ''}, ${tiempo.horas} hora${tiempo.horas !== 1 ? 's' : ''}`;
    } else if (tiempo.horas > 0) {
      return `${tiempo.horas} hora${tiempo.horas > 1 ? 's' : ''}, ${tiempo.minutos} min`;
    } else if (tiempo.minutos > 0) {
      return `${tiempo.minutos} minuto${tiempo.minutos > 1 ? 's' : ''}`;
    } else {
      return 'Menos de 1 minuto';
    }
  }

  getDiasRestantesClass(licencia: Licencia): string {
    // Si está inactivo, usar color gris
    if (licencia.estado === '0' || !licencia.activo) {
      return 'dias-inactivo';
    }

    if (!licencia.tiempoRestante || licencia.vencido) return 'dias-vencido';

    const totalHoras = licencia.horasRestantes || 0;

    if (totalHoras <= 24) return 'dias-critico';  // Menos de 1 día
    if (totalHoras <= 72) return 'dias-advertencia';  // Menos de 3 días
    if (totalHoras <= 168) return 'dias-precaucion';  // Menos de 1 semana
    return 'dias-ok';
  }

  formatFechaCreacion(fechaHora: string | undefined): string {
    if (!fechaHora) return 'Sin fecha';
    const date = new Date(fechaHora);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  descargarExcel(): void {
    const fechaCreacionStr = this.searchFechaCreacion ? this.formatDateForSearch(this.searchFechaCreacion) : undefined;

    this.licenciaService.descargarExcel(
      this.searchEmpresa,
      this.searchMac,
      this.searchEstado,
      fechaCreacionStr
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `licencias_${new Date().toISOString().slice(0,10)}.xlsx`;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.fire('Éxito', 'Excel descargado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al descargar Excel:', error);
        Swal.fire('Error', 'No se pudo descargar el Excel', 'error');
      }
    });
  }

  descargarPdf(): void {
    const fechaCreacionStr = this.searchFechaCreacion ? this.formatDateForSearch(this.searchFechaCreacion) : undefined;

    this.licenciaService.descargarPdf(
      this.searchEmpresa,
      this.searchMac,
      this.searchEstado,
      fechaCreacionStr
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `licencias_${new Date().toISOString().slice(0,10)}.pdf`;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.fire('Éxito', 'PDF descargado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al descargar PDF:', error);
        Swal.fire('Error', 'No se pudo descargar el PDF', 'error');
      }
    });
  }

  loadEjecutivos(): void {
    this.ejecutivoService.getEjecutivos(0, 1000).subscribe({
      next: (response) => {
        this.ejecutivos = response.content;
      },
      error: (error) => {
        console.error('Error al cargar ejecutivos:', error);
      }
    });
  }

  getEjecutivoNombre(ejecutivoId: number): string {
    const ejecutivo = this.ejecutivos.find(e => e.id === ejecutivoId);
    return ejecutivo ? ejecutivo.nombreEjecutivo : '';
  }

  getEjecutivoEmail(ejecutivoId: number): string {
    const ejecutivo = this.ejecutivos.find(e => e.id === ejecutivoId);
    return ejecutivo ? ejecutivo.email : '';
  }
}
