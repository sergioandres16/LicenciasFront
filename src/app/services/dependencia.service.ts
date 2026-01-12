import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from './proyecto.service';

export interface Dependencia {
  id?: number;
  razonSocial: string;
  abreviatura: string;
  estado: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateDependenciaRequest {
  razonSocial: string;
  abreviatura: string;
  estado?: string;
}

export interface UpdateDependenciaRequest {
  razonSocial?: string;
  abreviatura?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DependenciaService {
  private apiUrl = `${environment.apiBaseUrl}/administracion/dependencia`;

  constructor(private http: HttpClient) {}

  getDependencias(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC'): Observable<PageResponse<Dependencia>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Dependencia>>(this.apiUrl, { params });
  }

  getDependencia(id: number): Observable<Dependencia> {
    return this.http.get<Dependencia>(`${this.apiUrl}/${id}`);
  }

  createDependencia(dependencia: CreateDependenciaRequest): Observable<Dependencia> {
    return this.http.post<Dependencia>(this.apiUrl, dependencia);
  }

  updateDependencia(id: number, dependencia: UpdateDependenciaRequest): Observable<Dependencia> {
    return this.http.put<Dependencia>(`${this.apiUrl}/${id}`, dependencia);
  }

  deleteDependencia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchDependencias(razonSocial?: string, abreviatura?: string, estado?: string, page: number = 0, size: number = 10): Observable<PageResponse<Dependencia>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (razonSocial) {
      params = params.set('razonSocial', razonSocial);
    }

    if (abreviatura) {
      params = params.set('abreviatura', abreviatura);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<PageResponse<Dependencia>>(`${this.apiUrl}/search`, { params });
  }

  searchDependenciasConFechas(
    razonSocial?: string,
    abreviatura?: string,
    estado?: string,
    fechaInicio?: string,
    fechaFin?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Dependencia>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (razonSocial) {
      params = params.set('razonSocial', razonSocial);
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

    return this.http.get<PageResponse<Dependencia>>(`${this.apiUrl}/search`, { params });
  }

  descargarExcel(razonSocial?: string, abreviatura?: string, estado?: string, fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();

    if (razonSocial) {
      params = params.set('razonSocial', razonSocial);
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

  descargarPdf(razonSocial?: string, abreviatura?: string, estado?: string, fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();

    if (razonSocial) {
      params = params.set('razonSocial', razonSocial);
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
