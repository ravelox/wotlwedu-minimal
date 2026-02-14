import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { WotlweduElection } from '../datamodel/wotlwedu-election.model';
import { ElectionDataService } from '../service/electiondata.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  elections: WotlweduElection[] = [];

  errorMessage = '';

  constructor(
    private electionDataService: ElectionDataService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.electionDataService.dataChanged.subscribe({
        next: (elections) => {
          this.elections = elections || [];
        },
      })
    );

    this.electionDataService.getAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  // Home page currently displays election data only.
}
