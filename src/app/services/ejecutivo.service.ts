import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from './proyecto.service';

export interface Ejecutivo {
  id?: number;
  nombreEjecutivo: string;
  abreviatura: string;
  estado: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateEjecutivoRequest {
  nombreEjecutivo: string;
  abreviatura: string;
  estado?: string;
}

export interface UpdateEjecutivoRequest {
  nombreEjecutivo?: string;
  abreviatura?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EjecutivoService {
  private apiUrl = `${environment.apiBaseUrl}/administracion/ejecutivo`;

  constructor(private http: HttpClient) {}

  getEjecutivos(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC'): Observable<PageResponse<Ejecutivo>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Ejecutivo>>(this.apiUrl, { params });
  }

  getEjecutivo(id: number): Observable<Ejecutivo> {
    return this.http.get<Ejecutivo>(`${this.apiUrl}/${id}`);
  }

  createEjecutivo(ejecutivo: CreateEjecutivoRequest): Observable<Ejecutivo> {
    return this.http.post<Ejecutivo>(this.apiUrl, ejecutivo);
  }

  updateEjecutivo(id: number, ejecutivo: UpdateEjecutivoRequest): Observable<Ejecutivo> {
    return this.http.put<Ejecutivo>(`${this.apiUrl}/${id}`, ejecutivo);
  }

  deleteEjecutivo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchEjecutivos(nombre?: string, abreviatura?: string, estado?: string, page: number = 0, size: number = 10): Observable<PageResponse<Ejecutivo>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<PageResponse<Ejecutivo>>(`${this.apiUrl}/search`, { params });
  }

  searchEjecutivosConFechas(
    nombre?: string,
    abreviatura?: string,
    estado?: string,
    fechaInicio?: string,
    fechaFin?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Ejecutivo>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
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

    return this.http.get<PageResponse<Ejecutivo>>(`${this.apiUrl}/search`, { params });
  }

  descargarExcel(nombre?: string, abreviatura?: string, estado?: string, fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
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

    return this.http.get(`${this.apiUrl}/descargar-excel`, {
      params,
      responseType: 'blob'
    });
  }

  descargarPdf(nombre?: string, abreviatura?: string, estado?: string, fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
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

    return this.http.get(`${this.apiUrl}/descargar-pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
