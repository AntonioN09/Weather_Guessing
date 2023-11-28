import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { WeatherComponent } from './weather/weather.component';
import { HttpClientModule } from '@angular/common/http';
import { authGuard } from './auth.guard';
import { publicGuard } from './public.guard';

const routes: Routes = [
  { path: '', redirectTo: '/public/login', pathMatch: 'full' }, 
  {
    path: 'public',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [publicGuard]
      },
      {
        path: 'registration',
        component: RegistrationComponent,
        canActivate: [publicGuard]
      }
    ]
  },
  {
    path: 'private',
    children: [
      {
        path: 'weather',
        component: WeatherComponent, canActivate: [authGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule], 
  exports: [RouterModule]
})
export class AppRoutingModule { }
