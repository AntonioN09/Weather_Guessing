import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError, mergeMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private locationUrl = 'http://dataservice.accuweather.com/locations/v1/cities/search';
  private weatherUrl = 'http://dataservice.accuweather.com/forecasts/v1/daily/1day';
  private apiKey = 'zcmHVe0UAcvVHU6CYm3jVPs5QhMZUjKS';

  constructor(private http: HttpClient) {}

  getLocationData(city:String): Observable<any> {
     return this.http.jsonp(`${this.locationUrl}?apikey=${this.apiKey}&q=${city}`, 'callback');
  }
  getWeatherData(city:String): Observable<any> {
    return this.getLocationData(city).pipe(
      mergeMap((locationData: any) => {
        const locationKey = locationData[0]?.Key;
        if (locationKey) {
          return this.http.jsonp(`${this.weatherUrl}/${locationKey}?apikey=${this.apiKey}`, 'callback');
        } 
        else {
          return throwError(() => 'Location key not found');
        }
      }),
      catchError(error => {
        console.error('Error:', error);
        return throwError(() => 'Failed to retrieve weather data');
      })
    );
  }
}

