import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { Auth } from '../../core/auth/auth';
import { DatePipe } from '@angular/common';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports:[DatePipe, LoadingSpinner],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  user: User | null = null;
   isLoading = true;

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.isLoading = false;
  }

  getInitials(): string {
    if (!this.user?.name) {
      return 'U';
    }

    return this.user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}