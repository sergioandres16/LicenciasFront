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
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

import { ProyectoService, Proyecto, CreateProyectoRequest, UpdateProyectoRequest } from '../../services/proyecto.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { ExportDialogComponent } from '../../components/export-dialog/export-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proyectos',
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
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss']
})
export class ProyectosComponent implements OnInit, OnDestroy {

  @ViewChild('proyectoDialog') proyectoDialog!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: any;

  proyectos: Proyecto[] = [];
  displayedColumns: string[] = ['idProducto', 'producto', 'fechaInicio', 'vigencia', 'vigenciaRestante', 'correos', 'estado', 'acciones'];

  // Paginación
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Búsqueda
  searchIdProducto = '';
  searchProducto = '';
  searchCorreo = '';
  searchEstado = '';

// Opciones de estado para el filtro
  estadoOpciones = [
    { value: 'ACTIVO', label: 'Activo', class: 'estado-activo' },
    { value: 'PROXIMO_VENCER', label: 'Próximo a Vencer', class: 'estado-advertencia' },
    { value: 'CRITICO', label: 'Crítico', class: 'estado-critico' },
    { value: 'VENCIDO', label: 'Vencido', class: 'estado-vencido' },
    { value: 'INACTIVO', label: 'Inactivo', class: 'estado-inactivo' },
    { value: 'SIN_DATOS', label: 'Sin Datos', class: 'estado-inactivo' }
  ];

  // Formulario
  proyectoForm!: FormGroup;
  isEditing = false;
  currentProyectoId?: number;

  // Carga de archivo
  selectedFile: File | null = null;
  isUploading = false;

  // Timer para actualizar vigencia restante
  updateTimer: any;

  // Opciones de vigencia
  vigenciaValores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 24, 30];

  vigenciaUnidades = [
    { value: 'dias', label: 'Días' },
    { value: 'semanas', label: 'Semanas' },
    { value: 'meses', label: 'Meses' },
    { value: 'anos', label: 'Años' }
  ];

  constructor(
    private proyectoService: ProyectoService,
    private excelService: ExcelExportService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadProyectos();
    // Actualizar cada minuto para refrescar vigencia restante
    this.updateTimer = setInterval(() => {
      this.loadProyectos();
    }, 60000); // 1 minuto
  }

  ngOnDestroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  createForm(): void {
    this.proyectoForm = this.fb.group({
      idProducto: ['', [Validators.required]],
      producto: ['', [Validators.required]],
      fechaInicio: [new Date(), [Validators.required]],
      vigenciaValor: [1, [Validators.required, Validators.min(1)]],
      vigenciaUnidad: ['meses', [Validators.required]],
      correoVendedor1: ['', [Validators.required, Validators.email]],
      correoVendedor2: ['', [Validators.email]],
      correoJefeVendedor: ['', [Validators.email]]
    });
  }

  loadProyectos(): void {
    this.proyectoService.getProyectos(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.proyectos = response.content;
          this.totalElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error al cargar proyectos:', error);
          Swal.fire('Error', 'No se pudieron cargar los proyectos', 'error');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProyectos();
  }

  buscar(): void {
    // Preparar parámetros de búsqueda
    const params: any = {
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.searchIdProducto) {
      params.idProducto = this.searchIdProducto;
    }
    if (this.searchProducto) {
      params.producto = this.searchProducto;
    }
    if (this.searchCorreo) {
      params.correo = this.searchCorreo;
    }
    if (this.searchEstado) {
      params.estado = this.searchEstado;
    }

    console.log('Buscando con filtros:', params);

    // Llamar al servicio con búsqueda avanzada por estado
    this.proyectoService.searchProyectosConEstado(
      this.searchIdProducto,
      this.searchProducto,
      this.searchCorreo,
      this.searchEstado,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        console.log('Resultados encontrados:', response.totalElements);
        this.proyectos = response.content;
        this.totalElements = response.totalElements;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        Swal.fire('Error', 'Error al buscar proyectos', 'error');
      }
    });
  }

  limpiarBusqueda(): void {
    this.searchIdProducto = '';
    this.searchProducto = '';
    this.searchCorreo = '';
    this.searchEstado = '';
    this.loadProyectos();
  }

  openDialog(proyecto?: Proyecto): void {
    this.isEditing = !!proyecto;
    this.currentProyectoId = proyecto?.id;

    if (proyecto) {
      // Parsear vigencia para edición
      let vigenciaValor = 1;
      let vigenciaUnidad = 'meses';

      if (proyecto.vigencia) {
        const match = proyecto.vigencia.match(/(\d+)\s*(día|dias|día|días|semana|semanas|mes|meses|año|anos|año|años)/i);
        if (match) {
          vigenciaValor = parseInt(match[1]);
          const unidad = match[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          if (unidad.includes('dia')) {
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

      const fechaInicio = new Date(proyecto.fechaInicio);
      this.proyectoForm.patchValue({
        idProducto: proyecto.idProducto,
        producto: proyecto.producto,
        fechaInicio: fechaInicio,
        vigenciaValor: vigenciaValor,
        vigenciaUnidad: vigenciaUnidad,
        correoVendedor1: proyecto.correoVendedor1,
        correoVendedor2: proyecto.correoVendedor2 || '',
        correoJefeVendedor: proyecto.correoJefeVendedor || ''
      });
    } else {
      this.proyectoForm.reset({
        fechaInicio: new Date(),
        vigenciaValor: 1,
        vigenciaUnidad: 'meses'
      });
    }

    this.dialog.open(this.proyectoDialog, {
      width: '700px',
      disableClose: true
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.proyectoForm.reset();
    this.isEditing = false;
    this.currentProyectoId = undefined;
  }

  onSubmit(): void {
    if (this.proyectoForm.invalid) {
      Object.keys(this.proyectoForm.controls).forEach(key => {
        this.proyectoForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.proyectoForm.value;
    const fechaInicio = formValue.fechaInicio instanceof Date
      ? formValue.fechaInicio.toISOString()
      : formValue.fechaInicio;

    // Construir vigencia como texto
    const vigencia = this.construirVigenciaTexto(formValue.vigenciaValor, formValue.vigenciaUnidad);

    if (this.isEditing && this.currentProyectoId) {
      const updateRequest: UpdateProyectoRequest = {
        idProducto: formValue.idProducto,
        producto: formValue.producto,
        fechaInicio: fechaInicio,
        vigencia: vigencia,
        correoVendedor1: formValue.correoVendedor1,
        correoVendedor2: formValue.correoVendedor2 || undefined,
        correoJefeVendedor: formValue.correoJefeVendedor || undefined
      };

      this.proyectoService.updateProyecto(this.currentProyectoId, updateRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Proyecto actualizado correctamente', 'success');
            this.closeDialog();
            this.loadProyectos();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            Swal.fire('Error', error.error?.message || 'Error al actualizar el proyecto', 'error');
          }
        });
    } else {
      const createRequest: CreateProyectoRequest = {
        idProducto: formValue.idProducto,
        producto: formValue.producto,
        fechaInicio: fechaInicio,
        vigencia: vigencia,
        correoVendedor1: formValue.correoVendedor1,
        correoVendedor2: formValue.correoVendedor2 || undefined,
        correoJefeVendedor: formValue.correoJefeVendedor || undefined
      };

      this.proyectoService.createProyecto(createRequest)
        .subscribe({
          next: () => {
            Swal.fire('Éxito', 'Proyecto creado correctamente', 'success');
            this.closeDialog();
            this.loadProyectos();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            Swal.fire('Error', error.error?.message || 'Error al crear el proyecto', 'error');
          }
        });
    }
  }

  construirVigenciaTexto(valor: number, unidad: string): string {
    let unidadTexto = '';

    switch (unidad) {
      case 'dias':
        unidadTexto = valor === 1 ? 'día' : 'días';
        break;
      case 'semanas':
        unidadTexto = valor === 1 ? 'semana' : 'semanas';
        break;
      case 'meses':
        unidadTexto = valor === 1 ? 'mes' : 'meses';
        break;
      case 'anos':
        unidadTexto = valor === 1 ? 'año' : 'años';
        break;
    }

    return `${valor} ${unidadTexto}`;
  }

  deleteProyecto(proyecto: Proyecto): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el proyecto ${proyecto.idProducto} - ${proyecto.producto}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && proyecto.id) {
        this.proyectoService.deleteProyecto(proyecto.id)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'El proyecto ha sido eliminado', 'success');
              this.loadProyectos();
            },
            error: (error) => {
              console.error('Error al eliminar:', error);
              Swal.fire('Error', 'No se pudo eliminar el proyecto', 'error');
            }
          });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo por extensión y tipo MIME
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.xlsx', '.xls'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      // Lista ampliada de tipos MIME válidos para Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/xlsx',
        'application/xls',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/octet-stream' // Algunos navegadores reportan este tipo para archivos Excel
      ];

      if (!hasValidExtension || (!validTypes.includes(file.type) && file.type !== '')) {
        console.log('Tipo de archivo detectado:', file.type);
        console.log('Nombre del archivo:', file.name);
        Swal.fire('Error', 'Por favor seleccione un archivo Excel válido (.xlsx o .xls)', 'error');
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('Error', 'El archivo no debe superar los 10MB', 'error');
        return;
      }

      this.selectedFile = file;
      this.snackBar.open(`Archivo seleccionado: ${file.name}`, 'OK', { duration: 3000 });
    }
  }

  cargarExcel(): void {
    if (!this.selectedFile) {
      Swal.fire('Error', 'Por favor seleccione un archivo Excel', 'error');
      return;
    }

    this.isUploading = true;
    this.proyectoService.cargarDesdeExcel(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.isUploading = false;
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          Swal.fire({
            icon: 'success',
            title: 'Carga exitosa',
            html: `
              <p>${response.message}</p>
              <p><strong>Proyectos cargados:</strong> ${response.proyectosCargados}</p>
            `,
            confirmButtonText: 'OK'
          });

          this.loadProyectos();
        },
        error: (error) => {
          this.isUploading = false;
          console.error('Error al cargar archivo:', error);
          Swal.fire('Error', error.error?.message || 'Error al cargar el archivo', 'error');
        }
      });
  }

  enviarAlertas(): void {
    Swal.fire({
      title: '¿Enviar alertas?',
      text: 'Se enviarán correos de alerta a los proyectos próximos a vencer',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proyectoService.enviarAlertas()
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

  getEstadoLabel(proyecto: Proyecto): string {
    if (!proyecto.activo) return 'INACTIVO';
    if (proyecto.vigenciaRestante === undefined || proyecto.vigenciaRestante === null) return 'SIN DATOS';
    if (proyecto.vigenciaRestante <= 0) return 'VENCIDO';
    if (proyecto.vigenciaRestante <= 30) return 'CRÍTICO';
    if (proyecto.vigenciaRestante <= 60) return 'PRÓXIMO A VENCER';
    return 'ACTIVO';
  }

  getEstadoClass(proyecto: Proyecto): string {
    const estado = this.getEstadoLabel(proyecto);
    switch (estado) {
      case 'ACTIVO': return 'estado-activo';
      case 'PRÓXIMO A VENCER': return 'estado-advertencia';
      case 'CRÍTICO': return 'estado-critico';
      case 'VENCIDO': return 'estado-vencido';
      case 'INACTIVO': return 'estado-inactivo';
      case 'SIN DATOS': return 'estado-inactivo';
      default: return 'estado-inactivo';
    }
  }

  getVigenciaRestanteInfo(proyecto: Proyecto): string {
    if (!proyecto.vigenciaRestante || proyecto.vigenciaRestante <= 0) {
      return 'Vencido';
    }

    const dias = proyecto.vigenciaRestante;
    if (dias === 1) return '1 día';
    if (dias < 30) return `${dias} días`;
    if (dias < 365) {
      const meses = Math.floor(dias / 30);
      return meses === 1 ? '1 mes' : `${meses} meses`;
    }

    const anos = Math.floor(dias / 365);
    return anos === 1 ? '1 año' : `${anos} años`;
  }

  getVigenciaRestanteClass(proyecto: Proyecto): string {
    if (!proyecto.vigenciaRestante || proyecto.vigenciaRestante <= 0) return 'vigencia-vencida';
    if (proyecto.vigenciaRestante <= 30) return 'vigencia-critica';
    if (proyecto.vigenciaRestante <= 60) return 'vigencia-advertencia';
    if (proyecto.vigenciaRestante <= 180) return 'vigencia-precaucion';
    return 'vigencia-ok';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getCorreosInfo(proyecto: Proyecto): string[] {
    const correos = [];
    if (proyecto.correoVendedor1) {
      correos.push(`Vendedor 1: ${proyecto.correoVendedor1}`);
    }
    if (proyecto.correoVendedor2) {
      correos.push(`Vendedor 2: ${proyecto.correoVendedor2}`);
    }
    if (proyecto.correoJefeVendedor) {
      correos.push(`Jefe: ${proyecto.correoJefeVendedor}`);
    }
    return correos;
  }

  getCorreosTooltip(proyecto: Proyecto): string {
    return this.getCorreosInfo(proyecto).join('\n');
  }

  getCorreosPrincipales(proyecto: Proyecto): string {
    return proyecto.correoVendedor1 || '';
  }

  getCorreosAdicionales(proyecto: Proyecto): number {
    let count = 0;
    if (proyecto.correoVendedor2) count++;
    if (proyecto.correoJefeVendedor) count++;
    return count;
  }

  descargarPlantilla(): void {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      width: '600px',
      data: {
        proyectos: this.proyectos,
        totalProyectos: this.totalElements
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.procesarDescarga(result);
      }
    });
  }

  // Método alternativo para descargar plantilla directamente del backend
  descargarPlantillaBackend(): void {
    this.proyectoService.descargarPlantillaBackend().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantilla_proyectos_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.snackBar.open('Plantilla descargada', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error descargando plantilla del backend:', error);
        Swal.fire('Error', 'No se pudo descargar la plantilla', 'error');
      }
    });
  }

  private procesarDescarga(options: any): void {
    console.log('Procesando descarga con opciones:', options);

    switch (options.option) {
      case 'template':
        console.log('Generando plantilla...');
        this.excelService.generateTemplate();
        this.snackBar.open('Plantilla descargada exitosamente', 'OK', { duration: 3000 });
        break;

      case 'current':
        this.exportarProyectosActuales(options);
        break;

      case 'all':
        this.exportarTodosLosProyectos(options);
        break;

      case 'custom':
        this.exportarProyectosPersonalizados(options);
        break;
    }
  }

  private exportarProyectosActuales(options: any): void {
    let proyectosParaExportar = [...this.proyectos];

    // Filtrar según las opciones
    if (!options.includeInactive) {
      proyectosParaExportar = proyectosParaExportar.filter(p => p.activo);
    }
    if (!options.includeExpired) {
      proyectosParaExportar = proyectosParaExportar.filter(p => !p.vencido);
    }

    this.excelService.exportSelectedProyectos(proyectosParaExportar);
    this.snackBar.open(`${proyectosParaExportar.length} proyectos exportados`, 'OK', { duration: 3000 });
  }

  private exportarTodosLosProyectos(options: any): void {
    // Obtener todos los proyectos sin paginación
    this.proyectoService.getProyectos(0, this.totalElements).subscribe({
      next: (response) => {
        let todosLosProyectos = response.content;

        // Filtrar según las opciones
        if (!options.includeInactive) {
          todosLosProyectos = todosLosProyectos.filter(p => p.activo);
        }
        if (!options.includeExpired) {
          todosLosProyectos = todosLosProyectos.filter(p => !p.vencido);
        }

        this.excelService.exportSelectedProyectos(todosLosProyectos);
        this.snackBar.open(`${todosLosProyectos.length} proyectos exportados`, 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al obtener todos los proyectos:', error);
        Swal.fire('Error', 'No se pudieron obtener todos los proyectos', 'error');
      }
    });
  }

  private exportarProyectosPersonalizados(options: any): void {
    const cantidad = Math.min(options.customCount, this.totalElements);

    this.proyectoService.getProyectos(0, cantidad).subscribe({
      next: (response) => {
        let proyectosPersonalizados = response.content;

        // Filtrar según las opciones
        if (!options.includeInactive) {
          proyectosPersonalizados = proyectosPersonalizados.filter(p => p.activo);
        }
        if (!options.includeExpired) {
          proyectosPersonalizados = proyectosPersonalizados.filter(p => !p.vencido);
        }

        this.excelService.exportSelectedProyectos(proyectosPersonalizados);
        this.snackBar.open(`${proyectosPersonalizados.length} proyectos exportados`, 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al obtener proyectos personalizados:', error);
        Swal.fire('Error', 'No se pudieron obtener los proyectos', 'error');
      }
    });
  }
}
