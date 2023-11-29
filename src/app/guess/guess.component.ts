import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable, firstValueFrom } from 'rxjs';
import { switchMap, take, first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-prediction',
  templateUrl: './guess.component.html',
  styleUrls: ['./guess.component.css']
})

export class GuessComponent implements OnInit {
  user$: Observable<firebase.User | null>;
  userPredictions$: Observable<{ userId: string; value: number; time: number; isCorrect: boolean }[]>;
  predictionForm: FormGroup;

  constructor(private weatherService: WeatherService, private afAuth: AngularFireAuth, private afs: AngularFirestore, private formBuilder:FormBuilder) {
    this.user$ = this.afAuth.authState;
    this.userPredictions$ = this.user$.pipe(
      // Map not viable because it keeps previous obsevables
      switchMap(user => {
        if (user) {
          return this.afs
            .collection<{ userId: string; value: number; time: number; isCorrect: boolean }>('predictions', ref =>
              ref.where('userId', '==', user.uid).orderBy('time', 'desc')
            )
            .valueChanges();
        } else {
          return [];
        }
      })
    );
    this.predictionForm = this.formBuilder.group({
      predictionValue: [null, [Validators.required, Validators.min(0)]],
    });
  }

  temperature: any;

  ngOnInit(): void {
    this.weatherService.getWeatherData("Bucharest").subscribe(data => {
      const fahrenheitTemp = data.DailyForecasts[0].Temperature.Maximum.Value;
      const celciusTemp = Math.round((fahrenheitTemp - 32) * 5 / 9);
      this.temperature = celciusTemp;
    });
  }

  async submitForm(): Promise<void> {
    if (this.predictionForm.valid) {
      const user = await this.afAuth.authState.pipe(take(1)).toPromise();

      if (user) {
        this.checkCorrectPrediction();
        const userId = user.uid;
        const canSubmitPrediction = await this.checkLastPrediction();

        if (canSubmitPrediction) {
          const predictionValue = this.predictionForm.get('predictionValue')?.value;
          const time = new Date().getTime();
          const isCorrect = false;
          this.afs.collection<{ userId: string; value: number; time: number; isCorrect: boolean }>('predictions').add({
            userId,
            value: predictionValue,
            time,
            isCorrect
          });
          console.log(userId, predictionValue, time, isCorrect);
          this.predictionForm.reset();
        } else {
          console.log('You have already submitted a prediction for today.');
        }
      }
    }
  }

  async checkLastPrediction(): Promise<boolean>{
    return new Promise<boolean>((resolve) => {
      this.userPredictions$.pipe(first()).subscribe((lastPrediction) => {
        if (!lastPrediction || !lastPrediction[0] || this.isDayPassed(lastPrediction[0].time)) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  isDayPassed(lastTimestamp: number): boolean {
    const twentyFourHoursInMillis = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
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

  async checkCorrectPrediction(): Promise<void> {
    this.userPredictions$.pipe(first()).subscribe((predictions) => {
        predictions.forEach((prediction) => {
            if (this.isYesterday(prediction.time) && prediction.value == this.temperature) {
                console.log('Correct prediction:', prediction);
                this.updateIsCorrectInDatabase(prediction);
            }
        });
    });
  }

  private async updateIsCorrectInDatabase(prediction: { userId: string; time: number }): Promise<void> {
    const collectionRef = this.afs.collection<{ userId: string; value: number; time: number; isCorrect: boolean }>('predictions');
    
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
