import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Auth } from '../auth';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})


export class Login {

loading = false;

  form;

  constructor(
    private fb: FormBuilder, 
    private auth: Auth,
    private router: Router,
   ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) return;
    
    this.loading = true;

    this.auth.login(normalizedEmail, password!).subscribe({
      next: () => {
        this.auth.me().subscribe({
          next: (me: any) => {
          this.loading = false;
          this.router.navigate(['dashboard']);
          },
          error: (err) => {
            this.loading = false;
            console.log('Erreur /me', err?.error ?? err);
          },
        });
      },
      error: (err) => {
            this.loading = false;
            console.log('Erreur loggin', err?.error ?? err);
      },
    });
  }
}
