import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { LoginComponent } from '../../matdialogs/login/login.component';
import { Router, RouterModule } from '@angular/router';
import { RegisterComponent } from '../../matdialogs/register/register.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatButtonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  readonly dialog = inject(MatDialog)

  openLogin(){
    this.dialog.open(LoginComponent, {
      width: '30vw',
      height: '55vh',
    })
  }
  openRegister(){
    this.dialog.open(RegisterComponent, {
      width: '30vw',
      height: '70vh',
    })
  }

  constructor(
    private router: Router
  ){}
  navigate(){
    this.router.navigate(['my-logs']);
  }
}
