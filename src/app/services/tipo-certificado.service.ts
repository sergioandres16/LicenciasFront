import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TipoCertificado {
  id?: number;
  nombreCertificado: string;
  abreviatura: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateTipoCertificadoRequest {
  nombreCertificado: string;
  abreviatura: string;
}

export interface UpdateTipoCertificadoRequest {
  nombreCertificado?: string;
  abreviatura?: string;
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
export class TipoCertificadoService {
  private apiUrl = `${environment.apiBaseUrl}/administracion/tipo-certificado`;

  constructor(private http: HttpClient) {}

  getTiposCertificado(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC'): Observable<PageResponse<TipoCertificado>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<TipoCertificado>>(this.apiUrl, { params });
  }

  getTipoCertificado(id: number): Observable<TipoCertificado> {
    return this.http.get<TipoCertificado>(`${this.apiUrl}/${id}`);
  }

  createTipoCertificado(tipoCertificado: CreateTipoCertificadoRequest): Observable<TipoCertificado> {
    return this.http.post<TipoCertificado>(this.apiUrl, tipoCertificado);
  }

  updateTipoCertificado(id: number, tipoCertificado: UpdateTipoCertificadoRequest): Observable<TipoCertificado> {
    return this.http.put<TipoCertificado>(`${this.apiUrl}/${id}`, tipoCertificado);
  }

  deleteTipoCertificado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchTiposCertificado(nombre?: string, abreviatura?: string, page: number = 0, size: number = 10): Observable<PageResponse<TipoCertificado>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
    }

    return this.http.get<PageResponse<TipoCertificado>>(`${this.apiUrl}/search`, { params });
  }

  searchTiposCertificadoConFechas(
    nombre?: string,
    abreviatura?: string,
    fechaInicio?: string,
    fechaFin?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<TipoCertificado>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
    }

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<PageResponse<TipoCertificado>>(`${this.apiUrl}/search`, { params });
  }

  descargarExcel(nombre?: string, abreviatura?: string, fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
    }

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get(`${this.apiUrl}/descargar-excel`, {
      params,
      responseType: 'blob'
    });
  }

  descargarPdf(nombre?: string, abreviatura?: string, fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
    }

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get(`${this.apiUrl}/descargar-pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
