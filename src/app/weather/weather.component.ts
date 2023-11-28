import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})

export class WeatherComponent implements OnInit {
  title: any;
  location: any;
  temperature: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.weatherService.getLocationData("Bucharest").subscribe(data => {
      this.location = data[0].LocalizedName;
    });
    this.weatherService.getWeatherData("Bucharest").subscribe(data => {
      const fahrenheitTemp = data.DailyForecasts[0].Temperature.Maximum.Value;
      const celciusTemp = Math.round((fahrenheitTemp - 32) * 5 / 9);
      this.temperature = celciusTemp;
    });
  }
}
