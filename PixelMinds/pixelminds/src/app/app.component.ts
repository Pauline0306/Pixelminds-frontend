// src/app/app.component.ts

import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Correct named import
import { RouterModule } from '@angular/router'; // If using routing
// Import other necessary modules

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, // Indicates it's a standalone component
  imports: [
    HttpClientModule, // Import HttpClientModule here
    RouterModule,      // Import RouterModule or other modules as needed
    // Add other imports
  ]
})
export class AppComponent {
  title = 'PixelMinds';
  
  // ... (rest of your component code)
}
