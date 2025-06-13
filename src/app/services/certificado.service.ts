import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Certificado {
  id?: number;
  fechaEmision: string;
  fechaVencimiento: string;
  ejecutivoId: number;
  ejecutivoNombre?: string;
  tipoCertificado: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  numeroDocumento: string;
  departamento?: string;
  cargo?: string;
  correoElectronico?: string;
  razonSocial?: string;
  numeroRuc?: string;
  direccion?: string;
  codigoPostal?: string;
  telefono?: string;
  correoEjecutivo1?: string;
  correoEjecutivo2?: string;
  correoEjecutivo3?: string;
  vigenciaDias?: number;
  estado?: string;
  fechaCarga?: string;
  fechaActualizacion?: string;
  activo?: boolean;
}

export interface CreateCertificadoRequest {
  fechaEmision: string;
  fechaVencimiento: string;
  ejecutivoId: number;
  tipoCertificado: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  numeroDocumento: string;
  departamento?: string;
  cargo?: string;
  correoElectronico?: string;
  razonSocial?: string;
  numeroRuc?: string;
  direccion?: string;
  codigoPostal?: string;
  telefono?: string;
  correoEjecutivo1?: string;
  correoEjecutivo2?: string;
  correoEjecutivo3?: string;
}

export interface UpdateCertificadoRequest {
  fechaEmision?: string;
  fechaVencimiento?: string;
  ejecutivoId?: number;
  tipoCertificado?: string;
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  numeroDocumento?: string;
  departamento?: string;
  cargo?: string;
  correoElectronico?: string;
  razonSocial?: string;
  numeroRuc?: string;
  direccion?: string;
  codigoPostal?: string;
  telefono?: string;
  correoEjecutivo1?: string;
  correoEjecutivo2?: string;
  correoEjecutivo3?: string;
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
  certificadosCargados: number;
  certificados: Certificado[];
}

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  private apiUrl = `${environment.apiBaseUrl}/certificados`;

  constructor(private http: HttpClient) {}

  getCertificados(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC'): Observable<PageResponse<Certificado>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Certificado>>(this.apiUrl, { params });
  }

  getCertificado(id: number): Observable<Certificado> {
    return this.http.get<Certificado>(`${this.apiUrl}/${id}`);
  }

  createCertificado(certificado: CreateCertificadoRequest): Observable<Certificado> {
    return this.http.post<Certificado>(this.apiUrl, certificado);
  }

  updateCertificado(id: number, certificado: UpdateCertificadoRequest): Observable<Certificado> {
    return this.http.put<Certificado>(`${this.apiUrl}/${id}`, certificado);
  }

  deleteCertificado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchCertificados(
    ejecutivoId?: number,
    razonSocial?: string,
    nombres?: string,
    estado?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Certificado>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (ejecutivoId) {
      params = params.set('ejecutivoId', ejecutivoId.toString());
    }
    if (razonSocial) {
      params = params.set('razonSocial', razonSocial);
    }
    if (nombres) {
      params = params.set('nombres', nombres);
    }
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<PageResponse<Certificado>>(`${this.apiUrl}/buscar`, { params });
  }

  cargarExcel(file: File): Observable<CargaExcelResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<CargaExcelResponse>(`${this.apiUrl}/cargar-excel`, formData);
  }

  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/descargar-plantilla`, {
      responseType: 'blob'
    });
  }

  enviarAlertas(): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-alertas`, {});
  }

  actualizarVigencias(): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-vigencias`, {});
  }
}
