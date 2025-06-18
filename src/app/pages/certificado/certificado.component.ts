import {Component, OnInit, OnDestroy, ViewChild, TemplateRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TipoCertificadoService, TipoCertificado } from '../../services/tipo-certificado.service';

import { Certificado, CreateCertificadoRequest, CertificadoService } from '../../services/certificado.service';
import { EjecutivoService, Ejecutivo } from '../../services/ejecutivo.service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-certificado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    FormsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss']
})
export class CertificadoComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('fileInput') fileInput!: any;
  @ViewChild('certificadoDialog') certificadoDialog!: TemplateRef<any>;

  certificados: Certificado[] = [];
  ejecutivos: Ejecutivo[] = [];
  displayedColumns: string[] = [
    'numeroDocumento',
    'nombreCompleto',
    'tipoCertificado',
    'ejecutivo',
    'razonSocial',
    'fechaEmision',
    'fechaVencimiento',
    'vigenciaDias',
    'estado',
    'correos',
    'acciones'
  ];

  // Paginación
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Búsqueda
  searchEjecutivoId?: number;
  searchRazonSocial = '';
  searchNombres = '';
  searchEstado = '';

  // Opciones de estado para el filtro
  estadoOpciones = [
    { value: 'VIGENTE', label: 'Vigente', class: 'estado-vigente' },
    { value: 'POR_VENCER', label: 'Por Vencer', class: 'estado-por-vencer' },
    { value: 'VENCIDO', label: 'Vencido', class: 'estado-vencido' }
  ];

  tiposCertificadoData: TipoCertificado[] = [];

  // Formulario
  certificadoForm!: FormGroup;
  isEditing = false;
  currentCertificadoId?: number;

  // Carga de archivo
  selectedFile: File | null = null;
  isUploading = false;

  // Timer para actualizar vigencia
  updateTimer: any;

  constructor(
    private certificadoService: CertificadoService,
    private ejecutivoService: EjecutivoService,
    private tipoCertificadoService: TipoCertificadoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadCertificados();
    this.loadEjecutivos();
    this.loadTiposCertificado();
    this.updateTimer = setInterval(() => {
      this.loadCertificados();
    }, 300000); // 5 minutos
  }

  ngOnDestroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  createForm(): void {
    this.certificadoForm = this.fb.group({
      fechaEmision: [new Date(), [Validators.required]],
      fechaVencimiento: [new Date(), [Validators.required]],
      ejecutivoId: ['', [Validators.required]],
      tipoCertificado: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      primerApellido: ['', [Validators.required]],
      segundoApellido: [''],
      numeroDocumento: ['', [Validators.required, Validators.pattern('^[0-9]{8,20}$')]],
      departamento: [''],
      cargo: [''],
      correoElectronico: ['', [Validators.email]],
      razonSocial: [''],
      numeroRuc: ['', [Validators.pattern('^[0-9]{11}$')]],
      direccion: [''],
      codigoPostal: ['', [Validators.pattern('^[0-9]{5}$')]],
      telefono: ['', [Validators.pattern('^[0-9]{7,15}$')]],
      correoEjecutivo1: ['', [Validators.email]],
      correoEjecutivo2: ['', [Validators.email]],
      correoEjecutivo3: ['', [Validators.email]]
    });
  }

  loadCertificados(): void {
    this.certificadoService.getCertificados(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.certificados = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error al cargar certificados:', error);
          Swal.fire('Error', 'No se pudieron cargar los certificados', 'error');
        }
      });
  }

  loadEjecutivos(): void {
    this.ejecutivoService.getEjecutivos(0, 100)
      .subscribe({
        next: (response) => {
          this.ejecutivos = response.content.filter((e: Ejecutivo) => e.estado === '1');
        },
        error: (error) => {
          console.error('Error al cargar ejecutivos:', error);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCertificados();
  }

  buscar(): void {
    this.certificadoService.searchCertificados(
      this.searchEjecutivoId,
      this.searchRazonSocial,
      this.searchNombres,
      this.searchEstado,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.certificados = response.content;
        this.totalElements = response.totalElements;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        Swal.fire('Error', 'Error al buscar certificados', 'error');
      }
    });
  }

  limpiarBusqueda(): void {
    this.searchEjecutivoId = undefined;
    this.searchRazonSocial = '';
    this.searchNombres = '';
    this.searchEstado = '';
    this.loadCertificados();
  }

  openDialog(certificado?: Certificado): void {
    this.isEditing = !!certificado;
    this.currentCertificadoId = certificado?.id;

    if (certificado) {
      this.certificadoForm.patchValue({
        fechaEmision: new Date(certificado.fechaEmision),
        fechaVencimiento: new Date(certificado.fechaVencimiento),
        ejecutivoId: certificado.ejecutivoId,
        tipoCertificado: certificado.tipoCertificado,
        nombres: certificado.nombres,
        primerApellido: certificado.primerApellido,
        segundoApellido: certificado.segundoApellido,
        numeroDocumento: certificado.numeroDocumento,
        departamento: certificado.departamento,
        cargo: certificado.cargo,
        correoElectronico: certificado.correoElectronico,
        razonSocial: certificado.razonSocial,
        numeroRuc: certificado.numeroRuc,
        direccion: certificado.direccion,
        codigoPostal: certificado.codigoPostal,
        telefono: certificado.telefono,
        correoEjecutivo1: certificado.correoEjecutivo1,
        correoEjecutivo2: certificado.correoEjecutivo2,
        correoEjecutivo3: certificado.correoEjecutivo3
      });
    } else {
      this.certificadoForm.reset();
      this.certificadoForm.patchValue({
        fechaEmision: new Date(),
        fechaVencimiento: new Date()
      });
    }
    this.dialog.open(this.certificadoDialog, { width: '800px', disableClose: true });
  }

  closeDialog(): void {
    this.certificadoForm.reset();
    this.isEditing = false;
    this.currentCertificadoId = undefined;
    this.dialog.closeAll();
  }

  onSubmit(): void {
    if (this.certificadoForm.invalid) {
      Object.keys(this.certificadoForm.controls).forEach(key => {
        const control = this.certificadoForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const formValue = this.certificadoForm.value;
    const request = {
      ...formValue,
      fechaEmision: this.formatDateForBackend(formValue.fechaEmision),
      fechaVencimiento: this.formatDateForBackend(formValue.fechaVencimiento)
    };

    if (this.isEditing && this.currentCertificadoId) {
      this.certificadoService.updateCertificado(this.currentCertificadoId, request)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Certificado actualizado correctamente', 'success');
            this.closeDialog();
            this.loadCertificados();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            Swal.fire('Error', error.error?.message || 'Error al actualizar el certificado', 'error');
          }
        });
    } else {
      this.certificadoService.createCertificado(request)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Certificado creado correctamente', 'success');
            this.closeDialog();
            this.loadCertificados();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            Swal.fire('Error', error.error?.message || 'Error al crear el certificado', 'error');
          }
        });
    }
  }

  deleteCertificado(certificado: Certificado): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el certificado de ${certificado.nombres} ${certificado.primerApellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && certificado.id) {
        this.certificadoService.deleteCertificado(certificado.id)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'El certificado ha sido eliminado', 'success');
              this.loadCertificados();
            },
            error: (error) => {
              console.error('Error al eliminar:', error);
              Swal.fire('Error', 'No se pudo eliminar el certificado', 'error');
            }
          });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        Swal.fire('Error', 'Por favor seleccione un archivo Excel válido (.xls o .xlsx)', 'error');
        return;
      }
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.certificadoService.cargarExcel(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.isUploading = false;
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          Swal.fire({
            title: 'Éxito',
            text: `Se cargaron ${response.certificadosCargados} certificados correctamente`,
            icon: 'success'
          });

          this.loadCertificados();
        },
        error: (error) => {
          this.isUploading = false;
          console.error('Error al cargar archivo:', error);
          Swal.fire('Error', error.error?.message || 'Error al procesar el archivo', 'error');
        }
      });
  }

  descargarPlantilla(): void {
    this.certificadoService.descargarPlantilla()
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `plantilla_certificados_${new Date().toISOString().slice(0, 10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar plantilla:', error);
          Swal.fire('Error', 'No se pudo descargar la plantilla', 'error');
        }
      });
  }

  enviarAlertas(): void {
    Swal.fire({
      title: '¿Enviar alertas?',
      text: 'Se enviarán correos de alerta a los certificados próximos a vencer',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.certificadoService.enviarAlertas()
          .subscribe({
            next: (response) => {
              Swal.fire('Éxito', response.message || 'Alertas enviadas correctamente', 'success');
            },
            error: (error) => {
              console.error('Error al enviar alertas:', error);
              Swal.fire('Error', 'Error al enviar las alertas', 'error');
            }
          });
      }
    });
  }

  actualizarVigencias(): void {
    this.certificadoService.actualizarVigencias()
      .subscribe({
        next: () => {
          this.snackBar.open('Vigencias actualizadas', 'Cerrar', { duration: 3000 });
          this.loadCertificados();
        },
        error: (error) => {
          console.error('Error al actualizar vigencias:', error);
          this.snackBar.open('Error al actualizar vigencias', 'Cerrar', { duration: 3000 });
        }
      });
  }

  // Helpers
  getNombreCompleto(certificado: Certificado): string {
    let nombre = certificado.nombres;
    if (certificado.primerApellido) {
      nombre += ' ' + certificado.primerApellido;
    }
    if (certificado.segundoApellido) {
      nombre += ' ' + certificado.segundoApellido;
    }
    return nombre;
  }

  getVigenciaInfo(certificado: Certificado): string {
    if (!certificado.vigenciaDias) return 'Sin datos';

    const dias = certificado.vigenciaDias;
    if (dias < 0) return 'Vencido hace ' + Math.abs(dias) + ' días';
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return '1 día';
    if (dias < 30) return dias + ' días';
    if (dias < 365) {
      const meses = Math.floor(dias / 30);
      return meses === 1 ? '1 mes' : meses + ' meses';
    }
    const anos = Math.floor(dias / 365);
    return anos === 1 ? '1 año' : anos + ' años';
  }

  getVigenciaClass(certificado: Certificado): string {
    if (!certificado.vigenciaDias || certificado.vigenciaDias < 0) return 'vigencia-vencida';
    if (certificado.vigenciaDias <= 10) return 'vigencia-critica';
    if (certificado.vigenciaDias <= 30) return 'vigencia-advertencia';
    if (certificado.vigenciaDias <= 90) return 'vigencia-precaucion';
    return 'vigencia-ok';
  }

  getEstadoLabel(estado?: string): string {
    switch (estado) {
      case 'VIGENTE': return 'Vigente';
      case 'POR_VENCER': return 'Por Vencer';
      case 'VENCIDO': return 'Vencido';
      default: return 'Desconocido';
    }
  }

  getEstadoClass(estado?: string): string {
    switch (estado) {
      case 'VIGENTE': return 'estado-vigente';
      case 'POR_VENCER': return 'estado-por-vencer';
      case 'VENCIDO': return 'estado-vencido';
      default: return '';
    }
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  loadTiposCertificado(): void {
    this.tipoCertificadoService.getTiposCertificado(0, 100)
      .subscribe({
        next: (response) => {
          this.tiposCertificadoData = response.content;
        },
        error: (error) => {
          console.error('Error al cargar tipos de certificado:', error);
        }
      });
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  getCorreosInfo(certificado: Certificado): string[] {
    const correos = [];
    if (certificado.correoEjecutivo1) {
      correos.push(`Ejecutivo 1: ${certificado.correoEjecutivo1}`);
    }
    if (certificado.correoEjecutivo2) {
      correos.push(`Ejecutivo 2: ${certificado.correoEjecutivo2}`);
    }
    if (certificado.correoEjecutivo3) {
      correos.push(`Ejecutivo 3: ${certificado.correoEjecutivo3}`);
    }
    return correos;
  }

  getCorreosTooltip(certificado: Certificado): string {
    return this.getCorreosInfo(certificado).join('\n');
  }

  hasCorreos(certificado: Certificado): boolean {
    return !!(certificado.correoEjecutivo1 || certificado.correoEjecutivo2 || certificado.correoEjecutivo3);
  }
}
