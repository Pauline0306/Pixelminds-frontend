// src/app/services/auth.service.ts

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';



// Interfaces
export interface Post {
  token: string;
  title: string;
  content: string;
  tags: string;
  author_id: number;
  image?: File; // Optional if image upload is required
  // Add other relevant fields
}

export interface AdminPost extends Post {
  // Add any additional fields specific to admin posts
}

export interface UserProfile {
  id: number;
  usertype: string;
  role: string;
  // Add other relevant fields
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/pminds-api';
  private loggedIn: boolean = false;
  private emailVerified: boolean = false;
  private token: string | null = null;
  private nekot: string | null = null;

  showModal = false;

  constructor( 
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Retrieves the user profile from the JWT token.
   * @returns The user profile or null if no token is found.
   */
  getUserProfileFromToken(): UserProfile | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      // Assuming your token has a 'data' object with user info
      return decoded?.data as UserProfile || null;
    }
    return null;
  }

  /**
   * Checks whether the user is logged in.
   * @returns True if the user is logged in and the token is valid, false otherwise.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Retrieves all posts.
   * @returns An Observable containing the posts data.
   */
  getPostData(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<any>(`${this.apiUrl}/posts`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new post.
   * @param postData The data for the new post as FormData.
   * @returns An Observable of the server response.
   */
  createPost(postData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
      // 'Content-Type' is not set to allow the browser to set it automatically
    });

    return this.http.post<any>(`${this.apiUrl}/posts`, postData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new admin post.
   * @param postData The data for the new admin post as FormData.
   * @returns An Observable of the server response.
   */
  createAdminPost(postData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
      // 'Content-Type' is not set to allow the browser to set it automatically
    });

    // Assuming a different endpoint for admin posts. Adjust if necessary.
    return this.http.post<any>(`${this.apiUrl}/admin/posts`, postData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Updates a user's profile.
   * @param id The user ID.
   * @param userProfile The updated user profile data.
   * @returns An Observable of the server response.
   */
  updateProfile(id: number, userProfile: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.put<any>(`${this.apiUrl}/users/${id}`, userProfile, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Updates a post.
   * @param postId The post ID.
   * @param post The updated post data as FormData.
   * @returns An Observable of the server response.
   */
  updatePost(postId: number, post: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
      // 'Content-Type' is not set to allow the browser to set it automatically
    });

    return this.http.put<any>(`${this.apiUrl}/posts/${postId}`, post, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deletes a post.
   * @param postId The post ID.
   * @returns An Observable of the server response.
   */
  deletePost(postId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.delete<any>(`${this.apiUrl}/posts/${postId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Logs out the user.
   * @returns An Observable of void.
   */
  logout(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt');
    }
    this.router.navigate(['/login']);
    return of(); // Returns an Observable of void
  }

  /**
   * Registers a new user.
   * @param data The registration data.
   * @returns An Observable of the server response.
   */
  registerData(data: { 
    user_email: string; 
    password: string; 
    user_fullname: string; 
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    return this.http.post<any>(`${this.apiUrl}/main/register.php`, data, { headers })
      .pipe(
        tap(response => {
          console.log('Registration successful:', response);
        }),
        catchError(this.handleError)
      );
  }
  
  
  /**
   * Logs in a user.
   * @param email The user's email.
   * @param password The user's password.
   * @returns An Observable of the server response.
   */
  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/main/login`, { email, password }, { headers })
      .pipe(
        tap(res => {
          if (res && res.jwt) {
            const token = res.jwt;
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('jwt', token);
              console.log('Token stored successfully:', token);
            }
            // Optionally, you can decode the token and set user-related properties here
          } else {
            throw new Error('Invalid login response');
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Retrieves the JWT token from localStorage.
   * @returns The JWT token or null if not found.
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt');
      console.log('Retrieved Token:', token);
      return token;
    }
    return null;
  }

  /**
   * Decodes a JWT token.
   * @param token The JWT token.
   * @returns The decoded token or null if decoding fails.
   */
  decodeToken(token: string | null): any | null {
    if (!token) {
      console.error('No token provided for decoding');
      return null;
    }
  
    try {
      return jwtDecode(token); // Use jwtDecode function here
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Checks if the JWT token is expired.
   * @param token The JWT token.
   * @returns True if expired, false otherwise.
   */
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    const decodedToken = this.decodeToken(token);
    if (decodedToken && decodedToken.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
      return decodedToken.exp < currentTime;
    }
    return true;
  }

  /**
   * Refreshes the JWT token.
   * @returns An Observable of the server response.
   */
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap((res: any) => {
        if (res && res.jwt) {
          localStorage.setItem('jwt', res.jwt);
          console.log('Token refreshed successfully:', res.jwt);
        }
      }),
      catchError(error => {
        console.error('Refresh token failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Retrieves the user ID from the JWT token.
   * @returns The user ID or null if not available.
   */
  getUserId(): number | null {
    const token = this.getToken();
    if (this.isTokenExpired(token)) {
      this.logout().subscribe(); // Logout returns Observable
      return null; // Return null if the token is expired and user is logged out
    }
    const decodedToken = this.decodeToken(token);
    return decodedToken?.data?.id ?? null; // Return null if ID is not present
  }

  /**
   * Retrieves the user role from the JWT token.
   * @returns The user role or an empty string if not available.
   */
  getUserRole(): string {
    const token = this.getToken();
    if (this.isTokenExpired(token)) {
      this.logout().subscribe(); // Logout returns Observable
      return '';
    }
    const decodedToken = this.decodeToken(token);
    return decodedToken?.data?.role ?? '';
  }

  /**
   * Retrieves the instructor ID by user ID.
   * @param userId The user ID.
   * @returns An Observable containing the instructor ID.
   */
  getInstructorIdByUserId(userId: number): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any>(`${this.apiUrl}/getInstructorIdByUserId.php`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handles HTTP errors.
   * @param error The HTTP error response.
   * @returns An Observable that throws an error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMsg = `A client-side error occurred: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case 400:
          errorMsg = 'Bad Request: Please check the data you have entered.';
          break;
        case 403:
          errorMsg = 'Access Forbidden: You do not have permission to perform this action.';
          break;
        case 500:
          errorMsg = 'Server Error: Please try again later.';
          break;
        default:
          errorMsg = `Error ${error.status}: ${error.error.message || 'An error occurred.'}`;
      }
    }
    console.error(errorMsg);
    return throwError(() => new Error(errorMsg));
  }
  
}