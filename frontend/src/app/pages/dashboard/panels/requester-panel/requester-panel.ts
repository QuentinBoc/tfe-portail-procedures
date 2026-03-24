import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../interventions';

@Component({
  selector: 'app-requester-panel',
  imports: [],
  templateUrl: './requester-panel.html',
  styleUrl: './requester-panel.css',
})
export class RequesterPanel implements OnInit {
  interventions: any[] = [];

  constructor(private interventionService: InterventionService) {}

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
}

