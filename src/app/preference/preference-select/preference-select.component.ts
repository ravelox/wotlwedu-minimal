import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PreferenceDataService } from '../../service/preferencedata.service';
import { WotlweduPreference } from '../../datamodel/wotlwedu-preference.model';
import { FormControl, FormGroup } from '@angular/forms';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduPageStackService } from '../../service/pagestack.service';

@Component({
  selector: 'app-preference-select',
  templateUrl: './preference-select.component.html',
  styleUrl: './preference-select.component.css',
})
export class PreferenceSelectComponent implements OnInit, OnDestroy {
  @Input() selectMode: boolean = false;
  preferences: WotlweduPreference[];
  prefsSub: Subscription;
  hasPrevPage: boolean = false;
  hasNextPage: boolean = false;
  currentPage: number;
  preferenceData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();

  constructor(
    private preferenceDataService: PreferenceDataService,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.pageStack.setRouter(this.router);
    this.pages.setService(this.preferenceDataService);
    this.filter.setService(this.preferenceDataService);
    this.prefsSub = this.preferenceDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (preferences) => {
        this.preferences = preferences;
        this.preferences.map((x)=>{
          x.isAvailable = true;
          return x;
        })
        this.pages.updatePages();
      },
    });
  }

  ngOnDestroy() {
    this.prefsSub.unsubscribe();
  }

  onSelect(index: number) {
    this.preferenceDataService.setData(this.preferences[index]);
    this.pageStack.savePage();
    this.router.navigate(["/", "preference", this.preferences[index].id]);
  }

  onContextMenu(event, id: string){
    event.preventDefault();
  }

  onCancel() {
    this.pageStack.back();
  }

  onAdd() {
    this.pageStack.savePage()
    this.router.navigate(["/", "preference", "add"]);
  }
}
