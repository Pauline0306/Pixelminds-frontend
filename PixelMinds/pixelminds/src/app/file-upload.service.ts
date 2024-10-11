
/*import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = 'http://localhost/GALLERY-REST';

  constructor(private http: HttpClient) {}

  uploadImages(file: File, title: string, description: string, userId: number): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('user_id', userId.toString());

    return this.http.post<any>(${this.apiUrl}/this.uploadImages, formData)
    .pipe(
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => new Error(error.message || 'Error uploading file'));
      })
    );
}

getImages(): Observable<any> {
  const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID not found in session storage');
      return throwError('User ID not found');
    }
  return this.http.get<any>(${this.apiUrl}/this.getImages/${userId})
    .pipe(
      catchError(error => {
        console.error('Error fetching images:', error);
        return throwError(() => new Error(error.message || 'Error fetching images'));
      })
    );
}

}*/
