import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  isDayPassed(lastTimestamp: number): boolean {
    const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
    const currentTimestamp = new Date().getTime();
    return currentTimestamp - lastTimestamp > twentyFourHoursInMillis;
  }

  isYesterday(timestamp: number): boolean {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
  
    const dateToCheck = new Date(timestamp);
  
    return (
      dateToCheck.getDate() === yesterday.getDate() &&
      dateToCheck.getMonth() === yesterday.getMonth() &&
      dateToCheck.getFullYear() === yesterday.getFullYear()
    );
  }
}
