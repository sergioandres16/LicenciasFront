import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onRegister(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Todos los campos son requeridos';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
        timer: 3000
      });
      return;
    }

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res: AuthResponse) => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Ahora puedes iniciar sesión',
          timer: 3000
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        console.error('Error completo:', err);

        let errorMessage = 'Error en el registro';

        // Manejar diferentes tipos de errores
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.password) {
            // Errores de validación específicos
            errorMessage = err.error.password;
          } else if (err.error.username) {
            errorMessage = err.error.username;
          } else if (err.error.email) {
            errorMessage = err.error.email;
          } else {
            // Si el error es un objeto con múltiples campos
            const errorFields = Object.keys(err.error);
            if (errorFields.length > 0) {
              errorMessage = err.error[errorFields[0]];
            }
          }
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.errorMessage = errorMessage;

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);

        Swal.fire({
          icon: 'error',
          title: 'Error en el Registro',
          text: errorMessage,
          confirmButtonText: 'Entendido',
          timer: 5000
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
