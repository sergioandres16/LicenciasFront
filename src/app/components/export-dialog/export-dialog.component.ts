import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Proyecto } from '../../services/proyecto.service';

export interface ExportDialogData {
  proyectos: Proyecto[];
  totalProyectos: number;
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="dialog-icon">download</mat-icon>
      Opciones de Descarga
    </h2>

    <mat-dialog-content>
      <div class="export-options">
        <h3>¿Qué deseas descargar?</h3>

        <mat-radio-group [(ngModel)]="selectedOption" class="radio-group">
          <mat-radio-button value="template" class="radio-option">
            <div class="option-content">
              <strong>Plantilla vacía con ejemplos</strong>
              <p>Descarga una plantilla Excel con el formato correcto y 2 filas de ejemplo</p>
            </div>
          </mat-radio-button>

          <mat-divider></mat-divider>

          <mat-radio-button value="current" class="radio-option">
            <div class="option-content">
              <strong>Proyectos de la página actual</strong>
              <p>Exporta solo los {{data.proyectos.length}} proyectos visibles en la tabla actual</p>
            </div>
          </mat-radio-button>

          <mat-divider></mat-divider>

          <mat-radio-button value="all" class="radio-option">
            <div class="option-content">
              <strong>Todos los proyectos</strong>
              <p>Exporta todos los {{data.totalProyectos}} proyectos de la base de datos</p>
            </div>
          </mat-radio-button>

          <mat-divider></mat-divider>

          <mat-radio-button value="custom" class="radio-option">
            <div class="option-content">
              <strong>Rango personalizado</strong>
              <p>Especifica cuántos proyectos exportar</p>
            </div>
          </mat-radio-button>
        </mat-radio-group>

        <div *ngIf="selectedOption === 'custom'" class="custom-range">
          <mat-form-field appearance="outline">
            <mat-label>Cantidad de proyectos</mat-label>
            <input matInput
                   type="number"
                   [(ngModel)]="customCount"
                   [max]="data.totalProyectos"
                   min="1"
                   placeholder="Ej: 50">
            <mat-hint>Máximo: {{data.totalProyectos}} proyectos</mat-hint>
          </mat-form-field>
        </div>

        <div class="additional-options" *ngIf="selectedOption !== 'template'">
          <h4>Opciones adicionales:</h4>
          <mat-checkbox [(ngModel)]="includeInactive">
            Incluir proyectos inactivos
          </mat-checkbox>
          <mat-checkbox [(ngModel)]="includeExpired">
            Incluir proyectos vencidos
          </mat-checkbox>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button
              color="primary"
              (click)="onConfirm()"
              [disabled]="selectedOption === 'custom' && (!customCount || customCount < 1)">
        <mat-icon>download</mat-icon>
        Descargar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    .export-options {
      width: 500px;
      max-width: 100%;
    }

    h3 {
      color: #2c5aa0;
      margin-bottom: 20px;
    }

    h4 {
      color: #6c757d;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .radio-option {
      margin: 10px 0;
    }

    .option-content {
      margin-left: 10px;

      strong {
        display: block;
        margin-bottom: 5px;
        color: #333;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6c757d;
      }
    }

    .custom-range {
      margin-top: 20px;
      margin-left: 30px;
    }

    .additional-options {
      margin-top: 25px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 8px;

      mat-checkbox {
        display: block;
        margin: 10px 0;
      }
    }

    mat-divider {
      margin: 10px 0;
    }

    ::ng-deep {
      .mat-mdc-radio-button {
        margin: 8px 0;
      }

      .mat-mdc-dialog-title {
        background-color: #2c5aa0;
        color: white;
        margin: 0 !important;
        padding: 20px 24px !important;
      }

      .mat-mdc-dialog-content {
        padding: 24px !important;
      }

      .mat-mdc-dialog-actions {
        padding: 16px 24px !important;
        background-color: #f5f5f5;
      }
    }
  `]
})
export class ExportDialogComponent {
  selectedOption: string = 'template';
  customCount: number = 10;
  includeInactive: boolean = true;
  includeExpired: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({
      option: this.selectedOption,
      customCount: this.customCount,
      includeInactive: this.includeInactive,
      includeExpired: this.includeExpired
    });
  }
}
