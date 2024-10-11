import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  user_id: string = '';
  user_email: string = '';
  password: string = '';
  user_role: string = '';
  user_fullname: string = '';

  constructor(private AuthService: AuthService, private router: Router) {}

  onSubmit() {
    const data = {
      user_email: this.user_email,
      password: this.password,
      user_fullname: this.user_fullname,
    };
  
    console.log('Submitting registration data:', data);
  
    this.AuthService.registerData(data).subscribe(
      (response: any) => {
        console.log('Form data submitted successfully:', response);
        // Optionally, show a success message to the user
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.error('Error submitting form data:', error);
        // Optionally, display the error message to the user
        alert(error.message);
      }
    );
  }
  

  login() {
    this.router.navigate(['/login']);
  }
}
