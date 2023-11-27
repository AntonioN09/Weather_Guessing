import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styles: []
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(private afAuth: AngularFireAuth, private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  registerWithEmailAndPassword() {
    const email = this.email!.value;
    const password = this.password!.value;

    this.afAuth.createUserWithEmailAndPassword(email, password)
      .then(response => {
        console.log('Registration successful:', response.user);
      })
      .catch(error => {
        console.error('Registration error:', error.message);
      });
  }
}
