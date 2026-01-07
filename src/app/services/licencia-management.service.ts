import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Licencia {
  id?: number;
  empresa: string;
  mac: string;
  fechaHora?: string;
  estado: string;
  observacion?: string;
  vigencia?: string;  // Cambiado de vigenciaDias a vigencia (string)
  fechaVencimiento?: string;
  diasRestantes?: number;
  horasRestantes?: number;
  minutosRestantes?: number;
  tiempoRestante?: TiempoRestante;
  activo?: boolean;
  vencido?: boolean;
}

export interface TiempoRestante {
  dias: number;
  horas: number;
  minutos: number;
  totalMinutos: number;
}

export interface CreateLicenciaRequest {
  empresa: string;
  mac: string;
  estado: string;
  observacion?: string;
  vigenciaValor: number;
  vigenciaUnidad: string;
}

export interface UpdateLicenciaRequest {
  empresa?: string;
  mac?: string;
  estado?: string;
  observacion?: string;
  vigenciaValor?: number;
  vigenciaUnidad?: string;
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

@Injectable({
  providedIn: 'root'
})
export class LicenciaManagementService {
  private apiUrl = `${environment.apiBaseUrl}/licencias/management`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las licencias con paginación
   */
  getLicencias(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC'): Observable<PageResponse<Licencia>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Licencia>>(this.apiUrl, { params });
  }

  /**
   * Obtiene una licencia por ID
   */
  getLicencia(id: number): Observable<Licencia> {
    return this.http.get<Licencia>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva licencia
   */
  createLicencia(licencia: CreateLicenciaRequest): Observable<Licencia> {
    return this.http.post<Licencia>(this.apiUrl, licencia);
  }

  /**
   * Actualiza una licencia existente
   */
  updateLicencia(id: number, licencia: UpdateLicenciaRequest): Observable<Licencia> {
    return this.http.put<Licencia>(`${this.apiUrl}/${id}`, licencia);
  }

  /**
   * Elimina una licencia
   */
  deleteLicencia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca licencias por empresa o MAC
   */
  searchLicencias(empresa?: string, mac?: string, page: number = 0, size: number = 10): Observable<PageResponse<Licencia>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (empresa) {
      params = params.set('empresa', empresa);
    }

    if (mac) {
      params = params.set('mac', mac);
    }

    return this.http.get<PageResponse<Licencia>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Busca licencias por empresa, MAC, estado y fechas
   */
  searchLicenciasConFechas(
    empresa?: string,
    mac?: string,
    estado?: string,
    fechaInicio?: string,
    fechaFin?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Licencia>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (empresa) {
      params = params.set('empresa', empresa);
    }

    if (mac) {
      params = params.set('mac', mac);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<PageResponse<Licencia>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Descarga Excel de licencias según filtros
   */
  descargarExcel(empresa?: string, mac?: string, estado?: string, fechaCreacion?: string): Observable<Blob> {
    let params = new HttpParams();

    if (empresa) {
      params = params.set('empresa', empresa);
    }

    if (mac) {
      params = params.set('mac', mac);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    if (fechaCreacion) {
      params = params.set('fechaCreacion', fechaCreacion);
    }

    return this.http.get(`${this.apiUrl}/descargar-excel`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Descarga PDF de licencias según filtros
   */
  descargarPdf(empresa?: string, mac?: string, estado?: string, fechaCreacion?: string): Observable<Blob> {
    let params = new HttpParams();

    if (empresa) {
      params = params.set('empresa', empresa);
    }

    if (mac) {
      params = params.set('mac', mac);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    if (fechaCreacion) {
      params = params.set('fechaCreacion', fechaCreacion);
    }

    return this.http.get(`${this.apiUrl}/descargar-pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
