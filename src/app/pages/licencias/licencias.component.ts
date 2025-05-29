import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LicenciaManagementService, Licencia, CreateLicenciaRequest, UpdateLicenciaRequest } from '../../services/licencia-management.service';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-licencias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.scss']
})
export class LicenciasComponent implements OnInit, OnDestroy {

  @ViewChild('licenciaDialog') licenciaDialog!: TemplateRef<any>;

  licencias: Licencia[] = [];
  displayedColumns: string[] = ['id', 'empresa', 'mac', 'estado', 'vigencia', 'diasRestantes', 'acciones'];

  // Paginación
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Búsqueda
  searchEmpresa = '';
  searchMac = '';

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

  constructor(
    private licenciaService: LicenciaManagementService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadLicencias();
    // Actualizar cada minuto para refrescar el tiempo restante
    this.updateTimer = setInterval(() => {
      this.loadLicencias();
    }, 60000); // 60 segundos
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
    if (this.searchEmpresa || this.searchMac) {
      this.licenciaService.searchLicencias(this.searchEmpresa, this.searchMac, this.currentPage, this.pageSize)
        .subscribe({
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
    this.loadLicencias();
  }

  openDialog(licencia?: Licencia): void {
    this.isEditing = !!licencia;
    this.currentLicenciaId = licencia?.id;

    if (licencia) {
      // Calcular vigencia original para edición
      let vigenciaValor = 1;
      let vigenciaUnidad = 'dias';

      if (licencia.vigenciaDias) {
        if (licencia.vigenciaDias % 365 === 0) {
          vigenciaValor = licencia.vigenciaDias / 365;
          vigenciaUnidad = 'anos';
        } else if (licencia.vigenciaDias % 30 === 0) {
          vigenciaValor = licencia.vigenciaDias / 30;
          vigenciaUnidad = 'meses';
        } else if (licencia.vigenciaDias % 7 === 0) {
          vigenciaValor = licencia.vigenciaDias / 7;
          vigenciaUnidad = 'semanas';
        } else {
          vigenciaValor = licencia.vigenciaDias;
          vigenciaUnidad = 'dias';
        }
      }

      this.licenciaForm.patchValue({
        empresa: licencia.empresa,
        mac: licencia.mac,
        estado: licencia.estado,
        observacion: licencia.observacion || '',
        vigenciaValor: Math.min(vigenciaValor, 10),
        vigenciaUnidad: vigenciaUnidad
      });
    } else {
      this.licenciaForm.reset({
        estado: '1',
        vigenciaValor: 1,
        vigenciaUnidad: 'dias'
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
    if (!licencia.tiempoRestante || licencia.vencido) return 'dias-vencido';

    const totalHoras = licencia.horasRestantes || 0;

    if (totalHoras <= 24) return 'dias-critico';  // Menos de 1 día
    if (totalHoras <= 72) return 'dias-advertencia';  // Menos de 3 días
    if (totalHoras <= 168) return 'dias-precaucion';  // Menos de 1 semana
    return 'dias-ok';
  }
}
