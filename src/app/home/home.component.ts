import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { WotlweduElection } from '../datamodel/wotlwedu-election.model';
import { AIDataService } from '../service/aidata.service';
import { ElectionDataService } from '../service/electiondata.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  aiPrompt = 'Suggest food options for lunch';
  aiCategorizeText = 'We should grab pizza and sushi tonight';
  aiModerateText = 'Plan a calm and friendly meetup';
  aiAssistantQuery = 'Suggest quick ideas for tonight';
  aiImageId = '';

  elections: WotlweduElection[] = [];
  selectedElectionId = '';

  listSuggestions: any = null;
  categoryResult: any = null;
  moderationResult: any = null;
  assistantResult: any = null;
  notificationDigest: any = null;
  smartDefaults: any = null;
  electionSummary: any = null;
  electionRecommendations: any = null;
  participantSuggestions: any = null;
  imageDescription: any = null;

  errorMessage = '';

  constructor(
    private aiDataService: AIDataService,
    private electionDataService: ElectionDataService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.electionDataService.dataChanged.subscribe({
        next: (elections) => {
          this.elections = elections || [];
          if (!this.selectedElectionId && this.elections.length > 0) {
            this.selectedElectionId = this.elections[0].id;
          }
        },
      })
    );

    this.electionDataService.getAllData();
    this.loadDigest();
    this.loadDefaults();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  loadDigest() {
    this.aiDataService.getNotificationDigest().subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.notificationDigest = response.data;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load AI digest';
      },
    });
  }

  loadDefaults() {
    this.aiDataService.getSmartDefaults().subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.smartDefaults = response.data;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load smart defaults';
      },
    });
  }

  runSuggestItems() {
    this.aiDataService.suggestListItems(this.aiPrompt, 5).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.listSuggestions = response.data;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to generate list suggestions';
      },
    });
  }

  runCategorizeText() {
    this.aiDataService.categorizeText(this.aiCategorizeText).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.categoryResult = response.data;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to categorize text';
      },
    });
  }

  runModeration() {
    this.aiDataService.moderateText(this.aiModerateText).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.moderationResult = response.data;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to moderate text';
      },
    });
  }

  runAssistantQuery() {
    this.aiDataService.assistantQuery(this.aiAssistantQuery).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.assistantResult = response.data;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to run assistant query';
      },
    });
  }

  loadElectionSummary() {
    if (!this.selectedElectionId) return;
    this.aiDataService.getElectionSummary(this.selectedElectionId).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.electionSummary = response.data;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load election summary';
      },
    });
  }

  loadElectionRecommendations() {
    if (!this.selectedElectionId) return;
    this.aiDataService
      .getElectionRecommendations(this.selectedElectionId)
      .subscribe({
        next: (response) => {
          this.errorMessage = '';
          this.electionRecommendations = response.data;
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Unable to load election recommendations';
        },
      });
  }

  loadParticipantSuggestions() {
    if (!this.selectedElectionId) return;
    this.aiDataService.suggestParticipants(this.selectedElectionId, 5).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.participantSuggestions = response.data;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load participant suggestions';
      },
    });
  }

  loadImageDescription() {
    if (!this.aiImageId) return;
    this.aiDataService.describeImage(this.aiImageId).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.imageDescription = response.data;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to describe image';
      },
    });
  }
}
