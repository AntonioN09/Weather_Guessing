import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Prediction } from '../../models/prediction.model';
import { PredictionService } from 'src/services/prediction/prediction.service';

@Component({
  selector: 'app-prediction',
  templateUrl: './guess.component.html',
  styleUrls: ['./guess.component.css']
})

export class GuessComponent implements OnInit {
  predictionForm: FormGroup;
  userPredictions: Observable<Prediction[]>;

  constructor(private predictionService: PredictionService, private formBuilder:FormBuilder) {
    this.predictionForm = this.formBuilder.group({
      predictionValue: [null, [Validators.required, Validators.min(0)]],
    });
    this.userPredictions = this.predictionService.getPredictions();
  }

  ngOnInit(): void {}

  async submitForm(): Promise<void> {
    if (this.predictionForm.valid) {
      const predictionValue = this.predictionForm.get('predictionValue')?.value;
      this.predictionService.submitPrediction(predictionValue).then();
      this.predictionForm.reset();
    }
  }
}
