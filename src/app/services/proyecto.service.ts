import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Proyecto {
  id?: number;
  idProducto: string;
  producto: string;
  fechaInicio: string;
  vigencia: string;
  vigenciaRestante?: number;
  vendedor1Id: number;
  vendedor1Nombre?: string;
  vendedor1Email?: string;
  correoVendedor2?: string;
  correoJefeVendedor?: string;
  fechaCarga?: string;
  fechaActualizacion?: string;
  activo?: boolean;
  alerta30Enviada?: boolean;
  alerta60Enviada?: boolean;
  estado?: string;
  fechaVencimiento?: string;
  vencido?: boolean;
}

export interface CreateProyectoRequest {
  // idProducto se genera automáticamente en el backend
  producto: string;
  fechaInicio: string;
  vigencia: string;
  vendedor1Id: number;
  correoVendedor2?: string;
  correoJefeVendedor?: string;
}

export interface UpdateProyectoRequest {
  // idProducto NO es editable después de la creación
  producto?: string;
  fechaInicio?: string;
  vigencia?: string;
  vendedor1Id?: number;
  correoVendedor2?: string;
  correoJefeVendedor?: string;
  activo?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CargaExcelResponse {
  message: string;
  proyectosCargados: number;
  proyectos: Proyecto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = `${environment.apiBaseUrl}/proyectos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los proyectos con paginación
   */
  getProyectos(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC'): Observable<PageResponse<Proyecto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Proyecto>>(this.apiUrl, { params });
  }

  /**
   * Obtiene un proyecto por ID
   */
  getProyecto(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo proyecto
   */
  createProyecto(proyecto: CreateProyectoRequest): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, proyecto);
  }

  /**
   * Actualiza un proyecto existente
   */
  updateProyecto(id: number, proyecto: UpdateProyectoRequest): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto);
  }

  /**
   * Elimina un proyecto
   */
  deleteProyecto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca proyectos con filtros
   */
  searchProyectos(idProducto?: string, producto?: string, correo?: string, vigenciaMin?: number, page: number = 0, size: number = 10): Observable<PageResponse<Proyecto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (idProducto) {
      params = params.set('idProducto', idProducto);
    }

    if (producto) {
      params = params.set('producto', producto);
    }

    if (correo) {
      params = params.set('correo', correo);
    }

    if (vigenciaMin) {
      params = params.set('vigenciaMin', vigenciaMin.toString());
    }

    return this.http.get<PageResponse<Proyecto>>(`${this.apiUrl}/search`, { params });
  }

  searchProyectosConEstado(idProducto?: string, producto?: string, correo?: string, estado?: string, page: number = 0, size: number = 10): Observable<PageResponse<Proyecto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (idProducto) {
      params = params.set('idProducto', idProducto);
    }

    if (producto) {
      params = params.set('producto', producto);
    }

    if (correo) {
      params = params.set('correo', correo);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<PageResponse<Proyecto>>(`${this.apiUrl}/search-by-estado`, { params });
  }

  /**
   * Carga proyectos desde un archivo Excel
   */
  cargarDesdeExcel(file: File): Observable<CargaExcelResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<CargaExcelResponse>(`${this.apiUrl}/cargar-excel`, formData);
  }

  /**
   * Envía alertas de vencimiento manualmente
   */
  enviarAlertas(): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-alertas`, {});
  }

  /**
   * Actualiza las vigencias restantes manualmente
   */
  actualizarVigencias(): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-vigencias`, {});
  }

  /**
   * Descarga una plantilla de Excel desde el backend
   */
  descargarPlantillaBackend(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/plantilla-excel`, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga Excel de proyectos según filtros
   */
  descargarExcel(idProducto?: string, producto?: string, correo?: string, estado?: string): Observable<Blob> {
    let params = new HttpParams();

    if (idProducto) {
      params = params.set('idProducto', idProducto);
    }

    if (producto) {
      params = params.set('producto', producto);
    }

    if (correo) {
      params = params.set('correo', correo);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get(`${this.apiUrl}/descargar-excel`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Descarga PDF de proyectos según filtros
   */
  descargarPdf(idProducto?: string, producto?: string, correo?: string, estado?: string): Observable<Blob> {
    let params = new HttpParams();

    if (idProducto) {
      params = params.set('idProducto', idProducto);
    }

    if (producto) {
      params = params.set('producto', producto);
    }

    if (correo) {
      params = params.set('correo', correo);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get(`${this.apiUrl}/descargar-pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
