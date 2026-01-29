import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Proyecto } from './proyecto.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  private apiUrl = `${environment.apiBaseUrl}/proyectos`;

  constructor(private http: HttpClient) { }

  /**
   * Exporta proyectos a Excel
   */
  exportProyectosToExcel(proyectos: Proyecto[], filename: string = 'proyectos'): void {
    const worksheet = this.createWorksheet(proyectos);
    const workbook = { Sheets: { 'Proyectos': worksheet }, SheetNames: ['Proyectos'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename);
  }

  /**
   * Genera una plantilla vacía de Excel
   */
  generateTemplate(): void {
    const headers = [
      'idProducto',
      'Producto',
      'fechaInicio',
      'vigencia',
      'vigenciaRestante',
      'correoVendedor1',
      'correoVendedor2',
      'correoJefeVendedor'
    ];

    const ejemplos = [
      {
        idProducto: 'PROD-001',
        Producto: 'Sistema de Gestión (Ejemplo)',
        fechaInicio: '01/01/2024',
        vigencia: '1 año',
        vigenciaRestante: '',
        correoVendedor1: 'vendedor1@empresa.com',
        correoVendedor2: 'vendedor2@empresa.com',
        correoJefeVendedor: 'jefe@empresa.com'
      },
      {
        idProducto: 'PROD-002',
        Producto: 'Software Contable (Ejemplo)',
        fechaInicio: '15/03/2024',
        vigencia: '6 meses',
        vigenciaRestante: '',
        correoVendedor1: 'maria@empresa.com',
        correoVendedor2: '',
        correoJefeVendedor: 'supervisor@empresa.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(ejemplos, { header: headers });

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 15 }, // idProducto
      { wch: 30 }, // Producto
      { wch: 12 }, // fechaInicio
      { wch: 12 }, // vigencia
      { wch: 15 }, // vigenciaRestante
      { wch: 30 }, // correoVendedor1
      { wch: 30 }, // correoVendedor2
      { wch: 30 }  // correoJefeVendedor
    ];
    worksheet['!cols'] = colWidths;

    const workbook = { Sheets: { 'Plantilla': worksheet }, SheetNames: ['Plantilla'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'plantilla_proyectos');
  }

  /**
   * Exporta proyectos seleccionados con formato personalizado
   */
  exportSelectedProyectos(proyectos: Proyecto[], includeHeaders: boolean = true): void {
    const data = proyectos.map(p => ({
      idProducto: p.idProducto,
      Producto: p.producto,
      fechaInicio: this.formatDate(p.fechaInicio),
      vigencia: p.vigencia,
      vigenciaRestante: p.vigenciaRestante || '',
      vendedor1: p.vendedor1Nombre ? `${p.vendedor1Nombre} (${p.vendedor1Email})` : '',
      correoVendedor2: p.correoVendedor2 || '',
      correoJefeVendedor: p.correoJefeVendedor || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: !includeHeaders });

    // Ajustar anchos
    const colWidths = [
      { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 30 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = { Sheets: { 'Proyectos': worksheet }, SheetNames: ['Proyectos'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, `proyectos_export_${this.getTimestamp()}`);
  }

  private createWorksheet(proyectos: Proyecto[]): XLSX.WorkSheet {
    const data = proyectos.map(p => ({
      idProducto: p.idProducto,
      Producto: p.producto,
      fechaInicio: this.formatDate(p.fechaInicio),
      vigencia: p.vigencia,
      vigenciaRestante: p.vigenciaRestante || '',
      vendedor1: p.vendedor1Nombre ? `${p.vendedor1Nombre} (${p.vendedor1Email})` : '',
      correoVendedor2: p.correoVendedor2 || '',
      correoJefeVendedor: p.correoJefeVendedor || '',
      estado: p.estado || '',
      activo: p.activo ? 'Sí' : 'No'
    }));

    return XLSX.utils.json_to_sheet(data);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    try {
      const data: Blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      const fullFileName = `${fileName}_${this.getTimestamp()}.xlsx`;
      console.log('Intentando descargar archivo:', fullFileName);

      // Usar FileSaver
      saveAs(data, fullFileName);

      console.log('saveAs ejecutado para:', fullFileName);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);

      // Método alternativo si falla
      try {
        const data: Blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_${this.getTimestamp()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Descarga alternativa ejecutada');
      } catch (altError) {
        console.error('Error en método alternativo:', altError);
      }
    }
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10).replace(/-/g, '');
  }
}
