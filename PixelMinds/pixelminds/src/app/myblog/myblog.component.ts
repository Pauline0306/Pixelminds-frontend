import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-myblog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './myblog.component.html',
  styleUrls: ['./myblog.component.css']  // Fixed the typo here
})
export class MyBlogComponent implements OnInit {
  userProfile: any = null;
  showEditCrud: boolean = true;
  posts: any[] = [];
  filteredPosts: any[] = [];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
      this.getPosts();
    } else {
      console.error('Token not found');
      this.router.navigate(['/login']);  // Redirect if no token is found
    }
  }

  getPosts(): void {
    this.authService.getPostData().subscribe(
      (response: any) => {
        if (response.status === 'success' && response.data) {
          this.posts = response.data.filter(
            (post: any) => post.author_id === this.userProfile.id
          );
          this.posts.forEach((post) => {
            post.isEditing = false;
            post.edited = false;
          });
          this.filteredPosts = [...this.posts]; // Initialize filteredPosts with all posts
          console.log('Posts fetched successfully:', this.posts);
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  updateProfile(id: number, userProfile: any) {
    this.authService.updateProfile(id, userProfile).subscribe(
      (response: any) => {
        console.log('Profile updated successfully:', response);
      },
      (error: any) => {
        console.error('Error updating profile:', error);
      }
    );
  }

  filterPostsByMonth(month: number): void {
    this.filteredPosts = this.posts.filter(post => {
      const postMonth = new Date(post.created_at).getMonth() + 1;
      return postMonth === month;
    });
  }

  saveEdit(post: any) {
    post.edited = true;
    this.authService.updatePost(post.id, post).subscribe(
      (response: any) => {
        console.log('Post updated successfully:', response);
        post.isEditing = false;
        this.toggleEditCrud(true);  // Ensure the edit CRUD is shown after saving
      },
      (error: any) => {
        console.error('Error updating post:', error);
      }
    );
  }

  save() {
    const userId = this.userProfile.id; // Assuming `id` is part of `userProfile`
    this.updateProfile(userId, this.userProfile);
  }

  cancelEdit(post: any) {
    post.isEditing = false;
    this.getPosts();
  }

  editPost(post: any) {
    post.isEditing = true;
  }

  deletePost(postId: number) {
    this.authService.deletePost(postId).subscribe(
      (response: any) => {
        console.log('Post deleted successfully:', response);
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.filteredPosts = this.filteredPosts.filter((post) => post.id !== postId);
      },
      (error: any) => {
        console.error('Error deleting post:', error);
      }
    );
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Logout failed:', error);
      },
    });
  }

  toggleEditCrud(state?: boolean) {
    this.showEditCrud = state !== undefined ? state : !this.showEditCrud;
  }
}
