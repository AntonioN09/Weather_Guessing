import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = '/weather/locations/v1/adminareas/RO';

  constructor(private http: HttpClient) {}

  getWeatherData(): Observable<any> {
    const apiKey = 'zcmHVe0UAcvVHU6CYm3jVPs5QhMZUjKS'; 
    const headers = new HttpHeaders({
      'apikey': apiKey
    });
  
    return this.http.get(this.apiUrl, { headers: headers });
  }
}
