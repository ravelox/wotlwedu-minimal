import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { WotlweduVote } from '../../datamodel/wotlwedu-vote.model';
import { VoteDataService } from '../../service/votedata.service';
import { WotlweduItem } from '../../datamodel/wotlwedu-item.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-vote-cast',
  templateUrl: './vote-cast.component.html',
  styleUrl: './vote-cast.component.css',
})
export class VoteCastComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  voteSub: Subscription = null;
  currentVote: WotlweduVote = null;
  currentItem: WotlweduItem = null;
  alertBox: WotlweduAlert = new WotlweduAlert();
  private currentElectionId: string = null;

  constructor(private voteDataService: VoteDataService) {}

  ngOnInit() {
    this.voteDataService.reset();
    this.voteSub = this.voteDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (vote: WotlweduVote) => {
        this.currentVote = vote;
        if (vote) {
          this.currentElectionId = this.currentVote.election.id;
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.voteSub) this.voteSub.unsubscribe();
  }

  onCancel() {
    this.voteDataService.reset();
  }

  private getNextVote() {
    if (!this.currentElectionId) return;

    this.voteDataService.getNextVote(this.currentElectionId).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (response && response.data) {
          if (response.data.count > 0) {
            const vote = response.data.rows[0];
            this.currentVote = vote;
            if (this.currentVote.election) {
              this.currentElectionId = this.currentVote.election.id;
            }

            if (this.currentVote.item) {
              this.currentItem = this.currentVote.item;
            }
          } else {
            this.currentVote = null;
            this.voteDataService.refresh();
          }
        }
      },
    });
  }

  onVote(decision: string) {
    this.voteDataService.cast(this.currentVote.id, decision).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.getNextVote();
      },
    });
  }
}
