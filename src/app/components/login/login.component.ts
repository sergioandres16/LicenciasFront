import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, AuthResponse } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  formLogin!: FormGroup;
  submite: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.formLogin.controls;
  }

  onLogin() {
    if (this.formLogin.invalid) {
      this.submite = true;
      setTimeout(() => (this.submite = false), 5000);
      return;
    }

    const { usernameOrEmail, password } = this.formLogin.value;

    this.authService.login(usernameOrEmail, password).subscribe({
      next: (res: AuthResponse) => {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('correo', res.correo);
        sessionStorage.setItem('usuario', res.nombre);

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso',
          timer: 3000
        }).then(() => {
          this.router.navigate(['/inicio']);
        });
      },
      error: (err) => {
        console.error('Error completo:', err);

        let errorMessage = 'Credenciales inválidas. Inténtalo nuevamente.';

        // Manejar diferentes tipos de errores
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.usernameOrEmail) {
            errorMessage = err.error.usernameOrEmail;
          } else if (err.error.password) {
            errorMessage = err.error.password;
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

        // Verificar errores específicos del backend
        if (err.error?.message && err.error.message.includes("Full authentication is required")) {
          errorMessage = "Debes iniciar sesión con credenciales válidas.";
        } else if (err.status === 401) {
          errorMessage = "Usuario o contraseña incorrectos.";
        } else if (err.status === 404) {
          errorMessage = "Usuario no encontrado.";
        }

        this.errorMessage = errorMessage;

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);

        Swal.fire({
          icon: 'error',
          title: 'Error de Autenticación',
          text: errorMessage,
          confirmButtonText: 'Entendido',
          timer: 5000
        });
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
