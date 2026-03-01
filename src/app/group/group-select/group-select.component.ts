import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { GroupDataService } from "../../service/groupdata.service";
import { WotlweduGroup } from "../../datamodel/wotlwedu-group.model";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

type GroupCategoryGroup = {
  categoryName: string;
  groups: WotlweduGroup[];
  collapsed: boolean;
};

@Component({
  selector: "app-group-select",
  templateUrl: "./group-select.component.html",
  styleUrl: "./group-select.component.css",
})
export class GroupSelectComponent implements OnInit, OnDestroy {
  @Input() selectMode: boolean = false;
  groups: WotlweduGroup[];
  groupedGroups: GroupCategoryGroup[] = [];
  groupsSub: Subscription;
  groupData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private groupDataService: GroupDataService,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pages.setService(this.groupDataService);
    this.filter.setService(this.groupDataService);
    this.pageStack.setRouter(this.router);
    this.groupsSub = this.groupDataService.dataChanged.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (groups) => {
        this.groups = groups;
        this.groupGroups();
        this.pages.updatePages();
        this.loader.stop();
      },
    });
  }

  ngOnDestroy() {
    if( this.groupsSub ) this.groupsSub.unsubscribe();
  }

  private groupGroups() {
    if (!this.groups || this.groups.length === 0) {
      this.groupedGroups = [];
      return;
    }

    const groupedGroups = new Map<string, WotlweduGroup[]>();
    this.groups.forEach((group) => {
      const categoryName = group.category?.name?.trim() || "Uncategorized";
      const existingGroups = groupedGroups.get(categoryName) || [];
      existingGroups.push(group);
      groupedGroups.set(categoryName, existingGroups);
    });

    this.groupedGroups = Array.from(groupedGroups.entries())
      .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
      .map(([categoryName, groups]) => ({ categoryName, groups, collapsed: false }));
  }

  toggleCategory(group: GroupCategoryGroup) {
    group.collapsed = !group.collapsed;
  }

  onSelect(index: number) {
    this.groupDataService.setData(this.groups[index]);
    this.pageStack.savePage();
    this.router.navigate(["/", "group", this.groups[index].id]);
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }

  onAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/", "group", "add"]);
  }

  onCancel() {
    this.pageStack.back();
  }
}
