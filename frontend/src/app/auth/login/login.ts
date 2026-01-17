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

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.auth.me().subscribe({
          next: (me: any) => {
          if (me.role === 'ADMIN') this.router.navigate(['/admin']);
          if (me.role === 'PREFET') this.router.navigate(['/prefet']);
          if (me.role === 'CHEF_OUVRIER') this.router.navigate(['/chef_ouvrier']);
          if (me.role === 'OUVRIER') this.router.navigate(['/ouvrier']);
          },
        });
      },
      error: (err) => console.error('Erreur login:', err),
    });
  }
}