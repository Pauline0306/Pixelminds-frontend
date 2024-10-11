import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  username = '';
  password = '';

  userlogin() {
    this.authService.login(this.username, this.password).subscribe(
      (data) => {
        console.log('Login successful:', data);
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Login failed:', error);
        // Optionally display a user-friendly message
        alert('Login failed: ' + error.message);
        this.username = '';
        this.password = '';
      }
    );
  }
  

  createAccount() {
    this.router.navigate(['/register']);
  }
}
