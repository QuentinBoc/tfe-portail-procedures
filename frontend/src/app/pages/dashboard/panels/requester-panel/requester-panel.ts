import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-requester-panel',
  imports: [ReactiveFormsModule,],
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

  loadInterventions(): void {
    this.interventionService.getMine().subscribe({
      next: (data: any) => {
        this.interventions = data;
      },
      error: (err) => {
        console.log('Erreur', err)
      }
    })
  }

  ngOnInit(): void {
    this.loadInterventions()
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    this.interventionService.create(data).subscribe({
      next: () => {
        this.closeModal();
        this.loadInterventions();
      }
    })
  }
  openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }

  getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'PENDING':    'bg-yellow-100 text-yellow-800',
    'VALIDATED':  'bg-blue-100 text-blue-800',
    'ASSIGNED':   'bg-indigo-100 text-indigo-800',
    'PROCESSING': 'bg-purple-100 text-purple-800',
    'CLOSED':     'bg-green-100 text-green-800',
    'REJECTED':   'bg-red-100 text-red-800',
  };
  return classes[status] ?? 'bg-gray-100 text-gray-800';
}
}

