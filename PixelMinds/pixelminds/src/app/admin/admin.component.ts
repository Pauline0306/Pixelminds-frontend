import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  posts: any[] = [];
  postTitle: string = '';
  postSummary: string = '';
  postContent: string = '';
  userProfile: any; // Assuming this is where you store user profile data

  // viewPost(postId: string) {}

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token); // Log token
      console.log('User profile:', this.userProfile); // Log userProfile
    } else {
      console.error('Token not found');
    }
    this.getPosts();
  }

  getPosts(): void {
    this.authService.getPostData().subscribe(
      (response: any) => {
        if (response.status === 'success' && response.data) {
          // Filter posts based on user role
          let filteredPosts = response.data;
          if (this.userProfile.usertype !== 'admin') {
            //filteredPosts = filteredPosts.filter((post: any) => post.author_role !== 'admin');
          }
          // Sort posts by created_at in descending order
          this.posts = filteredPosts.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          console.log('Posts fetched successfully:', this.posts);
        } else {
          console.error('Invalid response structure:', response);
          // Handle unexpected response structure or show appropriate message
        }
      },
      (error) => {
        console.error('Error fetching posts:', error);
        // Handle error (e.g., show error message)
      }
    );
  }

  deletePost(postId: number) {
    this.authService.deletePost(postId).subscribe(
      (response) => {
        console.log('Post deleted successfully:', response);
        // Remove the deleted post from the posts array
        this.posts = this.posts.filter((post) => post.id !== postId);
      },
      (error) => {
        console.error('Error deleting post:', error);
        // Handle error (e.g., show error message)
      }
    );
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }
}
