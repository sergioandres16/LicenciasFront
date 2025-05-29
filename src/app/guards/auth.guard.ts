import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.authService.validateToken(token).pipe(
      map(isValid => {
        if (!isValid) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
