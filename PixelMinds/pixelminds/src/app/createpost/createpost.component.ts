// src/app/createpost/createpost.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-createpost',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, QuillModule, HeaderComponent ],
  templateUrl: './createpost.component.html',
  styleUrls: ['./createpost.component.css']
})
export class CreatepostComponent implements OnInit {
  isLoggedIn: boolean;
  showProfile: boolean = true;
  userProfile: any;
  posts: any[] = [];
  postTitle: string = '';
  postContent: string = '';
  postTags: string = '';
  selectedFile: File | null = null; // Holds the image file
  showPostForm: boolean = false;
  defaultProfilePicture: string = 'assets/images/default.png';
  searchTerm: string = '';
  editorModules: any;

  constructor(
    public authService: AuthService, // Removed generalService
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.editorModules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'bullet' }],
        [{ 'align': [] }]
      ]
    };
  }

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
    } else {
      console.error('Token not found');
    }
    this.getPosts();
  }

  getPosts(): void {
    this.authService.getPostData().subscribe(
      (response: any) => {
        if (response.status === 'success' && response.data) {
          let filteredPosts = response.data;
          if (!this.userProfile || this.userProfile.usertype !== 'admin') {
            filteredPosts = filteredPosts.filter((post: any) => post.author_role !== 'admin');
          }
          this.posts = filteredPosts.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          this.posts.forEach(post => {
            post.edited = localStorage.getItem(`edited_post_${post.id}`) === 'true';
          });
          console.log('Posts fetched successfully:', this.posts);
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
    }
  }

  createPost() {
    if (!this.postTitle.trim()) {
      this.postTitle = 'Untitled Blog';
    }
    if (!this.postContent.trim()) {
      console.error('Post must have content');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.postTitle);
    formData.append('content', this.postContent);
    formData.append('tags', this.postTags);
    formData.append('author_id', this.userProfile.id.toString()); // Ensure it's a string

    if (this.selectedFile) {
      formData.append('image', this.selectedFile); // Append the image file to the form data
    }

    this.authService.createPost(formData).subscribe(
      (response) => {
        console.log('Post created successfully:', response);
        this.postTitle = '';
        this.postContent = '';
        this.postTags = '';
        this.selectedFile = null; // Reset the selected file
        this.getPosts();
        // **Avoid using window.location.reload(). Instead, update the posts array or navigate as needed.**
        // window.location.reload();
      },
      (error) => {
        console.error('Error creating post:', error);
      }
    );
  }

  validateContent(form: NgForm) {
    if (!this.postContent.trim()) {
      form.form.controls['postcontent'].setErrors({ 'required': true });
    }
  }

  searchPosts(): void {
    if (!this.searchTerm.trim()) {
      this.getPosts();
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.posts = this.posts.filter((post: any) =>
      post.title.toLowerCase().includes(searchTermLower) ||
      (post.tags && post.tags.toLowerCase().includes(searchTermLower))
    );
  }

  togglePostForm() {
    this.showPostForm = !this.showPostForm;
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  viewPost(postId: string) {
    this.router.navigate(['/viewblog', postId]);
  }

  handleTagInput(event: any): void {
    this.postTags = event.target.value
      .split(/[,\s]+/)
      .filter((tag: string) => tag.trim() !== '')
      .map((tag: string) => tag.trim())
      .join(', ');
  }

  sanitizeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
