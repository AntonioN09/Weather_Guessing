import { Injectable } from '@angular/core';
import { WeatherService } from '../../services/weather/weather.service';
import { DateService } from '../../services/date/date.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { switchMap, take, first } from 'rxjs/operators';
import { Prediction } from '../../models/prediction.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  user: Observable<firebase.User | null>;
  userPredictions: Observable<Prediction[]>;
  temperature: any;

  constructor(private dateService: DateService,
              private weatherService: WeatherService, 
              private afAuth: AngularFireAuth, 
              private afs: AngularFirestore) {
    this.user = this.afAuth.authState;
    this.userPredictions = this.user.pipe(
      switchMap(user => {
        if (user) {
          return this.afs
            .collection<Prediction>('predictions', ref =>
              ref.where('userId', '==', user.uid).orderBy('time', 'desc')
            )
            .valueChanges();
        } else {
          return [];
        }
      })
    );
  }

  getPredictions(): Observable<Prediction[]>{
    return this.userPredictions;
  } 

  async submitPrediction(predictionValue: number): Promise<void> {
    try {
      const user = await this.afAuth.authState.pipe(take(1)).toPromise();
  
      if (user) {
        await this.checkCorrectPrediction();
        const userId = user.uid;
        const canSubmitPrediction = await this.checkLastPrediction();
  
        if (canSubmitPrediction) {
          const time = new Date().getTime();
          const crtDate = new Date();
          const date = `${crtDate.getDate()}.0${crtDate.getMonth() + 1}.${crtDate.getFullYear()}`;
          const isCorrect = false;
  
          await this.afs.collection<Prediction>('predictions').add({
            userId,
            value: predictionValue,
            time,
            date,
            isCorrect
          });
  
          console.log(userId, predictionValue, time, isCorrect);
        } else {
          console.log('You have already submitted a prediction for today.');
        }
      }
    } catch (error) {
      console.error('Error submitting prediction:', error);
      throw error;
    }
  }
  

  async checkLastPrediction(): Promise<boolean>{
    return new Promise<boolean>((resolve) => {
      this.userPredictions.pipe(first()).subscribe((lastPrediction) => {
        if (!lastPrediction || !lastPrediction[0] || this.dateService.isDayPassed(lastPrediction[0].time)) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  async checkCorrectPrediction(): Promise<void> {
    this.weatherService.getWeatherData('Bucharest')
    .pipe(
      switchMap((data) => {
        const fahrenheitTemp = data.DailyForecasts[0].Temperature.Maximum.Value;
        const celciusTemp = Math.round((fahrenheitTemp - 32) * 5 / 9);
        this.temperature = celciusTemp;
        return this.userPredictions.pipe(first());
      })
    )
    .subscribe((predictions) => {
      predictions.forEach((prediction) => {
        if (this.dateService.isYesterday(prediction.time) && prediction.value == this.temperature) {
          console.log('Correct prediction:', prediction);
          this.updateIsCorrectInDatabase(prediction);
        }
      });
    });
  }

  private async updateIsCorrectInDatabase(prediction: { userId: string; time: number }): Promise<void> {
    const collectionRef = this.afs.collection<Prediction>('predictions');
    const subscription = collectionRef.ref
      .where('userId', '==', prediction.userId)
      .where('time', '==', prediction.time)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const documentRef = collectionRef.doc(doc.id);
          const newData = { isCorrect: true };
          documentRef.update(newData);
          console.log('Updated data');
        });
        subscription(); 
      }, (error) => {
        console.error('Error updating document:', error);
      });
  }
}
