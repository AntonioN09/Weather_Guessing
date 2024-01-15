import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather/weather.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})

export class WeatherComponent implements OnInit {
  title: any;
  location: any;
  minTemp: any;
  maxTemp: any;
  weatherForm: FormGroup;

  constructor(private weatherService: WeatherService, private formBuilder: FormBuilder) {
    this.weatherForm = this.formBuilder.group({
      cityName: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  getWeather(): void {
    const cityName = this.weatherForm.get('cityName')?.value;
    if (cityName) {
      // Get the name of the city
      this.weatherService.getLocationData(cityName).subscribe(data => {
        this.location = data[0].LocalizedName;
      });
      // Get temperature in celsius
      this.weatherService.getWeatherData(cityName).subscribe(data => {
        const fahrenheitMaxTemp = data.DailyForecasts[0].Temperature.Maximum.Value;
        const celciusMaxTemp = Math.round((fahrenheitMaxTemp - 32) * 5 / 9);
        this.maxTemp = celciusMaxTemp;
        const fahrenheitMinTemp = data.DailyForecasts[0].Temperature.Minimum.Value;
        const celciusMinTemp = Math.round((fahrenheitMinTemp - 32) * 5 / 9);
        this.minTemp = celciusMinTemp;
      });
    }
  }
}
