import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ValidacionRequest {
  mac: string;
  empresa?: string;
  aplicacion?: string;
}

export interface ValidacionResponse {
  valido: boolean;
  mensaje: string;
  estado: string;
  empresa?: string;
  fechaValidacion: string;
  ultimaValidacion?: string;
  mac: string;
  codigoError?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LicenciaService {

  constructor(private http: HttpClient) {}

  /**
   * Valida una licencia enviando los datos al backend
   */
  validarLicencia(request: ValidacionRequest): Observable<ValidacionResponse> {
    return this.http.post<ValidacionResponse>(`${environment.apiBaseUrl}/licencias/validar`, request);
  }

  /**
   * Valida una licencia por MAC en la URL
   */
  validarLicenciaPorMac(mac: string): Observable<ValidacionResponse> {
    return this.http.get<ValidacionResponse>(`${environment.apiBaseUrl}/licencias/validar/${mac}`);
  }

  /**
   * Health check del servicio
   */
  healthCheck(): Observable<string> {
    return this.http.get(`${environment.apiBaseUrl}/licencias/health`, { responseType: 'text' });
  }
}
