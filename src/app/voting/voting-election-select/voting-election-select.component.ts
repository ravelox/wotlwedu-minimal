import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { WotlweduVote } from "../../datamodel/wotlwedu-vote.model";
import { VoteDataService } from "../../service/votedata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

@Component({
  selector: "app-voting-election-select",
  templateUrl: "./voting-election-select.component.html",
  styleUrl: "./voting-election-select.component.css",
})
export class VotingElectionSelectComponent implements OnInit, OnDestroy {
  votes: WotlweduVote[];
  voteSub: Subscription;
  selectedIndex: number = -1;
  cancelSub: Subscription;
  alertBox: WotlweduAlert = new WotlweduAlert();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(private voteDataService: VoteDataService) {}

  ngOnInit() {
    this.loader.start();
    this.voteDataService.reset();
    this.voteSub = this.voteDataService.refreshVotes.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.getMyVotes();
      },
    });
    this.getMyVotes();
  }

  ngOnDestroy() {
    if (this.voteSub) this.voteSub.unsubscribe();
    if (this.cancelSub) this.cancelSub.unsubscribe();
  }

  getMyVotes() {
    this.loader.start();
    this.voteDataService.getMyVotes().subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        if (response && response.data) {
          this.votes = response.data.rows;
        }
        this.loader.stop();
      },
    });
  }

  onSelect(index: number) {
    // If the filter reduces the number of elements in the array
    // to less than the current selected index, just clear out the
    // selected index
    if (this.selectedIndex > this.votes.length) {
      this.selectedIndex = -1;
    }

    // Otherwise, clear out the selected flag
    if (this.selectedIndex >= 0) {
      this.votes[this.selectedIndex].isSelected = false;
    }

    this.selectedIndex = index;
    this.votes[index].isSelected = true;

    this.voteDataService.setData(this.votes[index]);

    /* Listen for a cancelation */
    this.cancelSub = this.voteDataService.cancel.subscribe({
      next: (response) => {
        /* Only work on canceled items within the range of the votes array */
        if (this.selectedIndex < this.votes.length) {
          this.votes[this.selectedIndex].isSelected = false;
        }
        if (this.cancelSub) this.cancelSub.unsubscribe();
      },
    });
  }
}
