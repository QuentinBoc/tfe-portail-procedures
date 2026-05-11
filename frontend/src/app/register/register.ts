import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

form;
errorMessage = '';


  constructor(
      private fb: FormBuilder, 
      private router: Router,
      private auth: AuthService,
    ) {
      this.form = this.fb.group({
        email: ['', Validators.required],
        full_name: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      });
    }
    onSubmit() {
      if (this.form.invalid) return;
      const { email, full_name, password, confirmPassword } = this.form.value;
      const normalizedEmail = email?.trim().toLowerCase();
      if (password != confirmPassword){
        this.errorMessage='Les mots de passes ne correspondent pas';
        return;
      }
         
      if (!normalizedEmail || !password || !confirmPassword || !full_name) return; 
      
      this.auth.register(normalizedEmail, full_name, password).subscribe({
          next: () => {
            this.router.navigate(['login']);
          },
          error: (err) => {
            this.errorMessage='Certains champs sont incorrectes';
              console.error(err?.error ?? err);
            },
      })
    }
  }
