import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private router: Router,
    private authentication: AuthenticationService,
    private dialogRef: MatDialogRef<LoginComponent>
  ){}

  loginFormControl = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  login() {
    if (this.loginFormControl.valid) {
      this.authentication.login(this.loginFormControl.value).subscribe((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.router.navigate(['/chats/the-chatter']);
          this.dialogRef.close();
          console.log("true");
        } else {
          this.dialogRef.close();
          console.log("false");
        }
      });
    }
  }
}
