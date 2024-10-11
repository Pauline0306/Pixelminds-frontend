import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Removed unused Input
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from "../header/header.component";


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './homepage.component.html', // Ensure this matches your template file
  styleUrls: ['./homepage.component.css'], // Corrected property name

})
export class HomePageComponent implements OnInit {
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
  isVisible: boolean = false; // Single declaration
  selectedPost: any = null;
  selectedFile: File | null = null; // For handling file uploads

  constructor(private authService: AuthService, private router: Router) {} // Removed duplicate injection

  ngOnInit() {
    // Retrieve and set the user profile
    this.userProfile = this.authService.getUserProfileFromToken();

    // Fetch posts after setting userProfile
    this.getPosts();
  }

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
      (error: any) => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  // Method to handle file selection (optional)
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
    }
  }

  createPost() {
    // ... existing implementation ...
  }

  postAsAdmin() {
    // ... existing implementation ...
  }

  searchPosts(): void {
    if (!this.searchTerm.trim()) {
      this.getPosts(); // If search term is empty, fetch all posts
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();

    // Perform filtering based on search term in title, content, or tags
    this.posts = this.posts.filter((post: any) =>
      post.title.toLowerCase().includes(searchTermLower) ||
      (post.tags && post.tags.toLowerCase().includes(searchTermLower))
    );
  }

  filterPosts() {
    if (!this.searchTerm.trim()) {
      this.filteredPosts = [...this.posts]; // Reset to all posts if search term is empty
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter(post =>
      post.user_fullname.toLowerCase().includes(searchTermLower)
    );
  }
  
  togglePostForm() {
    // ... existing implementation ...
  }

  toggleAdminPostForm() {
    // ... existing implementation ...
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; // Adjust the number of characters as needed
    }
    return text;
  }

  viewPost(postId: string) {
    this.router.navigate(['/viewblog', postId]);
  }

  handleTagInput(event: any): void {
    // ... existing implementation ...
  }

  handleAdminTagInput(event: any): void {
    // ... existing implementation ...
  }

  filterPostsByMonth(month: number): void {
    // ... existing implementation ...
  }
}
