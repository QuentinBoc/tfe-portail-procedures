import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../interventions';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-requester-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './requester-panel.html',
  styleUrl: './requester-panel.css',
})
export class RequesterPanel implements OnInit {
interventions: any[] = [];
showModal = false;
form;
  

  constructor(
    private interventionService: InterventionService,
    private fb: FormBuilder
  ) {
      this.form = this.fb.group({
      title: [''],
      description: [''],
      location: [''],
      type: ['TECHNICAL']
      })
    }

  ngOnInit(): void {
    this.interventionService.getMine().subscribe({
      next: (data: any) => {
        this.interventions = data;
      },
      error: (err) => {
        console.log('Erreur', err)
      }
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    this.interventionService.create(data).subscribe({
      next: () => {
        this.closeModal();
        this.ngOnInit();
      }
    })
  }
  openModal() {
      this.showModal = true;
    }
  closeModal() {
    this.showModal = false;
  }
}

