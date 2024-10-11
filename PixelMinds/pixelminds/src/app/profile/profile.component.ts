import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  userProfile: any = {
    fullname: '',
    email: '',
  };
  showEditCrud: boolean = true;
  posts: any[] = [];
  profileForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      location: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token); // Log token
      console.log('User profile:', this.userProfile); // Log userProfile
      this.getPosts();
      this.setProfileFormValues();
    } else {
      console.error('Token not found');
    }
  }

  setProfileFormValues() {
    this.profileForm.patchValue({
      userName: this.userProfile.fullname || '',
      email: this.userProfile.email || '',
      password: '******', // Placeholder for password field
      location: this.userProfile.location || '',
      phone: this.userProfile.phone || ''
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
      this.save(); // Save profile after form submission
    }
  }

  getPosts(): void {
    this.authService.getPostData().subscribe(
      (response: any) => {
        if (response.status === 'success' && response.data) {
          // Filter posts based on author_id
          this.posts = response.data.filter(
            (post: any) => post.author_id === this.userProfile.id
          );
          // Add isEditing and edited properties to each post
          this.posts.forEach((post) => {
            post.isEditing = false;
            post.edited = false;
          });
          console.log('Posts fetched successfully:', this.posts);
        } else {
          console.error('Invalid response structure:', response);
          // Handle unexpected response structure or show appropriate message
        }
      },
      (error: any) => {
        console.error('Error fetching posts:', error);
        // Handle error (e.g., show error message)
      }
    );
  }

  goToAdminPanel() {
    this.router.navigate(['/adminview']);
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

  saveEdit(post: any) {
    post.edited = true;
    this.authService.updatePost(post.id, post).subscribe(
      (response: any) => {
        console.log('Post updated successfully:', response);
        post.isEditing = false;
        this.toggleEditCrud(post, true); // Reset to show edit and delete buttons
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
    this.getPosts(); // Re-fetch posts to discard unsaved changes
    this.toggleEditCrud(post, true); // Reset to show edit and delete buttons
  }

  editPost(post: any) {
    post.isEditing = true;
  }

  deletePost(postId: number) {
    this.authService.deletePost(postId).subscribe(
      (response: any) => {
        console.log('Post deleted successfully:', response);
        // Remove the deleted post from the posts array
        this.posts = this.posts.filter((post) => post.id !== postId);
      },
      (error: any) => {
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
      error: (error: any) => {
        console.error('Logout failed:', error);
      },
    });
  }

  toggleEditCrud(post: any, state?: boolean) {
    this.showEditCrud = state !== undefined ? state : !this.showEditCrud;
  }
}
