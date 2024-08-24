import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ElectionDataService } from '../service/electiondata.service';
import { WotlweduElection } from '../datamodel/wotlwedu-election.model';
import { WotlweduAlert } from '../controller/wotlwedu-alert-controller.class';
import { DataSignalService } from '../service/datasignal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WotlweduPageStackService } from '../service/pagestack.service';

class WotlweduDataPoint {
  label: string;
  value: number;
  percentage: number;
  unit: string;
}

class WotlweduStatistic {
  label: string;
  dataPoints: WotlweduDataPoint[];
  score: number;
}

class WotlweduStatsSheet {
  label: string;
  statistics: WotlweduStatistic[];
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit, OnDestroy {
  statsDetailsSub: Subscription;
  refreshSub: Subscription;
  currentElection: WotlweduElection;
  sheets: WotlweduStatsSheet[];
  alertBox: WotlweduAlert = new WotlweduAlert();
  statsAvailable: boolean = false;

  constructor(
    private electionDataService: ElectionDataService,
    private dataSignalService: DataSignalService,
    private route: ActivatedRoute,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.sheets = [];
    this.statsDetailsSub = this.electionDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (election: WotlweduElection) => {
        if (election) {
          this.currentElection = election;
          this.getElectionStats();
        }
      },
    });
    this.refreshSub = this.dataSignalService.refreshDataSignal.subscribe({
      next: (response) => {
        if (this.currentElection) {
          this.getElectionStats();
        }
      },
    });

    if( this.route.snapshot.params.electionId ) {
      this.electionDataService.getData( this.route.snapshot.params.electionId ).subscribe({
        next: (response)=>{
          if( response && response.data && response.data.election ) {
            this.electionDataService.setElectionDetails( response.data.election );
          }
        }
      })
    }
  }
  ngOnDestroy() {
    if (this.statsDetailsSub) this.statsDetailsSub.unsubscribe();
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  generateStatsOutput(stats: any) {
    this.sheets = [];

    if (!stats.statistics || !stats.lookup) return;

    for (let sectionLabel of Object.keys(stats.statistics)) {
      const currentSheet = new WotlweduStatsSheet();
      currentSheet.statistics = [];
      currentSheet.label = sectionLabel;
      const currentStats = stats.statistics[sectionLabel];
      for (let objectLabel of Object.keys(currentStats)) {
        const currentStatistic = new WotlweduStatistic();
        currentStatistic.dataPoints = [];
        currentStatistic.score = 0;
        currentStatistic.label = stats.lookup[objectLabel];

        for (let statusLabel of ['Yes', 'No', 'Maybe', 'Pending']) {
          const currentDataPoint = new WotlweduDataPoint();
          currentDataPoint.label = statusLabel;
          if (!currentStats[objectLabel][statusLabel]) {
            currentDataPoint.value = 0;
          } else {
            currentDataPoint.value = currentStats[objectLabel][statusLabel];
          }
          currentStatistic.dataPoints.push(currentDataPoint);
        }

        // Calculate the score based on the results
        // Yes = 3, Maybe = 1, No = -3, Pending = 0
        // While we're in there, calculate the total number of votes for the item
        // so we can display a percentage later
        let totalVotes = 0;
        currentStatistic.score = 0;
        for (let d of currentStatistic.dataPoints) {
          if (d.label === 'Yes') {
            currentStatistic.score += +3 * d.value;
          }
          if (d.label === 'Maybe') {
            currentStatistic.score += d.value;
          }
          if (d.label === 'No') {
            currentStatistic.score += -3 * d.value;
          }
          totalVotes += d.value;
        }
        for (let d of currentStatistic.dataPoints) {
          d.percentage = Math.round((d.value / totalVotes) * 100);
        }

        currentSheet.statistics.push(currentStatistic);
      }

      // Sort the statistics based on score before adding the sheet to the list
      currentSheet.statistics.sort((a, b) => {
        return b.score - a.score;
      });
      this.sheets.push(currentSheet);
    }
  }

  private getElectionStats() {
    this.electionDataService
      .getElectionStats(this.currentElection.id)
      .subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (response) => {
          if (response && response.data) {
            this.statsAvailable = response.data.hasStats;
            if (response.data.hasElection === false) {
              this.currentElection = null;
            }
            if (response.data.hasStats === true) {
              this.generateStatsOutput(response.data);
            }
          }
        },
      });
  }

  onCancel() {
    this.pageStack.back();
  }

}
