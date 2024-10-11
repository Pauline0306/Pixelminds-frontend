import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true, 
  imports: [RouterModule]
})
export class HeaderComponent {
  constructor(private router: Router) {}

  navigateTo(page: string): void {
    this.router.navigate([page]);
  }
}
