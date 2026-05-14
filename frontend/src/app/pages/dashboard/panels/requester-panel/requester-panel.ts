import { Intervention } from './../../../interfaces/intervention.model';
import { IStatusInfo } from './../../../interfaces/ilabel';
import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requester-panel',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './requester-panel.html',
  styleUrl: './requester-panel.css',
})
export class RequesterPanel implements OnInit {
  interventions: Intervention[] = [];
  showModal = false;
  selectedIntervention: Intervention | null = null;
  form;

  constructor(
    private interventionService: InterventionService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      type: ['TECHNICAL', [Validators.required]]
    })
  }

  /** Charge les interventions de l'utilisateur connecté */
  loadInterventions(): void {
    this.interventionService.getMine().subscribe({
      next: (data: Intervention[]) => {
        this.interventions = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }

  /** Charge les données au démarrage du composant */
  ngOnInit(): void {
    this.loadInterventions()
  }

  /** Valide et envoie la création d'une nouvelle intervention */
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

  /** Ouvre le formulaire de création */
  openModal(): void {
    this.showModal = true;
  }

  /** Ferme le formulaire de création */
  closeModal(): void {
    this.showModal = false;
  }

  /** Sélectionne une intervention pour afficher ses détails */
  selectIntervention(intervention: Intervention): void {
    this.selectedIntervention = intervention;
  }

  /** Ferme le panneau de détails */
  closeDetails(): void {
    this.selectedIntervention = null;
  }


  /** Extention des cartes interventions en accordéon */
  expandedId: number | null = null
  toggleDetails(id: number){
    if (this.expandedId === id){
      this.expandedId = null
    }else{
      this.expandedId = id
    }
  }

  /** Retourne le label français et la classe CSS selon le statut */
  getStatusClass(status: string): IStatusInfo {
    const classes: Record<string, IStatusInfo> = {
      'PENDING':    { label: 'En attente',            cssClass: 'text-yellow-500 bg-yellow-100/60 dark:bg-gray-800' },
      'VALIDATED':  { label: 'Validée',               cssClass: 'text-blue-500 bg-blue-100/60 dark:bg-gray-800' },
      'ASSIGNED':   { label: 'Assignée',              cssClass: 'text-blue-500 bg-blue-100/60 dark:bg-gray-800' },
      'PROCESSING': { label: 'Intervention en cours',  cssClass: 'text-blue-500 bg-blue-100/60 dark:bg-gray-800' },
      'CLOSED':     { label: 'Intervention clôturée',  cssClass: 'text-emerald-500 bg-emerald-100/60 dark:bg-gray-800' },
      'REJECTED':   { label: 'Intervention rejetée',   cssClass: 'text-red-500 bg-red-100/60 dark:bg-gray-800' },
    };
    return classes[status] ?? { label: 'Statut inconnu', cssClass: 'text-gray-500 bg-gray-100/60 dark:bg-gray-800' };
  }

  /** Retourne la classe CSS de la barre de progression selon le statut */
  getProgressWidth(status: string): string {
    const classes: Record<string, string> = {
      'PENDING':    'bg-blue-500 w-1/5 h-1.5',
      'VALIDATED':  'bg-blue-500 w-2/5 h-1.5',
      'ASSIGNED':   'bg-blue-500 w-3/5 h-1.5',
      'PROCESSING': 'bg-blue-500 w-4/5 h-1.5',
      'CLOSED':     'bg-emerald-500 w-full h-1.5',
      'REJECTED':   'bg-red-500 w-full h-1.5',
    };
    return classes[status] ?? 'bg-yellow-500 w-full h-1.5';
  }
}