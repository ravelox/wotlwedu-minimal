import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { WorkgroupDataService } from "../../service/workgroupdata.service";
import { WotlweduWorkgroup } from "../../datamodel/wotlwedu-workgroup.model";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

type WorkgroupCategoryGroup = {
  categoryName: string;
  workgroups: WotlweduWorkgroup[];
  collapsed: boolean;
};

@Component({
  selector: "app-workgroup-select",
  templateUrl: "./workgroup-select.component.html",
  styleUrl: "./workgroup-select.component.css",
})
export class WorkgroupSelectComponent implements OnInit, OnDestroy {
  @Input() selectMode: boolean = false;
  workgroups: WotlweduWorkgroup[];
  groupedWorkgroups: WorkgroupCategoryGroup[] = [];
  workgroupsSub: Subscription;
  workgroupData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private workgroupDataService: WorkgroupDataService,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pages.setService(this.workgroupDataService);
    this.filter.setService(this.workgroupDataService);
    this.pageStack.setRouter(this.router);
    this.workgroupsSub = this.workgroupDataService.dataChanged.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (workgroups) => {
        this.workgroups = workgroups;
        this.groupWorkgroups();
        this.pages.updatePages();
        this.loader.stop();
      },
    });
  }

  ngOnDestroy() {
    if (this.workgroupsSub) this.workgroupsSub.unsubscribe();
  }

  private groupWorkgroups() {
    if (!this.workgroups || this.workgroups.length === 0) {
      this.groupedWorkgroups = [];
      return;
    }

    const groupedWorkgroups = new Map<string, WotlweduWorkgroup[]>();
    this.workgroups.forEach((workgroup) => {
      const categoryName = workgroup.category?.name?.trim() || "Uncategorized";
      const existingWorkgroups = groupedWorkgroups.get(categoryName) || [];
      existingWorkgroups.push(workgroup);
      groupedWorkgroups.set(categoryName, existingWorkgroups);
    });

    this.groupedWorkgroups = Array.from(groupedWorkgroups.entries())
      .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
      .map(([categoryName, workgroups]) => ({ categoryName, workgroups, collapsed: false }));
  }

  toggleCategory(group: WorkgroupCategoryGroup) {
    group.collapsed = !group.collapsed;
  }

  onSelect(index: number) {
    this.workgroupDataService.setData(this.workgroups[index]);
    this.pageStack.savePage();
    this.router.navigate(["/", "workgroup", this.workgroups[index].id]);
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }

  onAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/", "workgroup", "add"]);
  }

  onCancel() {
    this.pageStack.back();
  }
}
