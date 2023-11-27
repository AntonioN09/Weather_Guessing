import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private afAuth: AngularFireAuth, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  loginWithEmailAndPassword() {
    const email = this.email!.value;
    const password = this.password!.value;

    this.afAuth.signInWithEmailAndPassword(email, password)
      .then(response => {
        console.log('Login successful:', response.user);
      })
      .catch(error => {
        console.error('Login error:', error.message);
      });
  }
}
