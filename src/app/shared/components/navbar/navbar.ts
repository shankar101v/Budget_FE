import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  isMobileMenuOpen = false;

toggleMobileMenu(): void {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
}

closeMobileMenu(): void {
  this.isMobileMenuOpen = false;
}

  constructor(
    public authService: Auth,
    private router: Router
  ) {}

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

  navigateFromMobileMenu(route: string): void {
  this.isMobileMenuOpen = false;

  setTimeout(() => {
    this.router.navigate([route]);
  }, 200);
}

}