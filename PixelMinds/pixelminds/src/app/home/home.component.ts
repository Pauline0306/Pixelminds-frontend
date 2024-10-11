import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Removed unused Input
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // Corrected property name
})
export class HomeComponent implements OnInit {
  posts: any[] = [];
  filteredPosts: any[] = [];
  postTitle: string = '';
  postContent: string = '';
  postTags: string = '';
  adminPostTitle: string = '';
  adminPostContent: string = '';
  adminPostTags: string = '';
  userProfile: any = null; // Initialize userProfile to null
  showAdminPostForm: boolean = false;
  showPostForm: boolean = false;
  defaultProfilePicture: string = 'assets/images/default.png';
  searchTerm: string = '';
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  isVisible: boolean = false; // Retained as a single declaration
  selectedPost: any = null;
  selectedFile: File | null = null; // For handling file uploads
truncateText: any;

  constructor(private authService: AuthService, private router: Router) {} // Removed duplicate injection

  ngOnInit() {
    // Retrieve and set the user profile
    this.userProfile = this.authService.getUserProfileFromToken();

    // Fetch posts after setting userProfile
    this.getPosts();
  }

  // Removed the duplicate @Input() isVisible declaration

  openModal(post: any) {
    this.selectedPost = post;
    this.isVisible = true;
  }

  closeModal() {
    this.selectedPost = null;
    this.isVisible = false;
  }

  getPosts(): void {
    this.authService.getPostData().subscribe(
      (response: any) => {
        if (response.status === 'success' && response.data) {
          let fetchedPosts = response.data;
          if (!this.userProfile || this.userProfile.usertype !== 'admin') {
            fetchedPosts = fetchedPosts.filter((post: any) => post.author_role !== 'admin');
          }
          this.posts = fetchedPosts.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          this.filteredPosts = [...this.posts]; // Initialize filteredPosts with all posts
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  // ... rest of your component code remains unchanged ...

}
