import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  isLoggedIn!: boolean;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isAuthenticated().subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  login(): void {
    this.router.navigate(['/public/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/public/login']);
  }
}