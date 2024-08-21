import { Component, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { RoleDataService } from "../../service/roledata.service";
import { FormControl, FormGroup } from "@angular/forms";
import { WotlweduRole } from "../../datamodel/wotlwedu-role.model";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

@Component({
  selector: "app-role-select",
  templateUrl: "./role-select.component.html",
  styleUrl: "./role-select.component.css",
})
export class RoleSelectComponent implements OnInit, OnDestroy {
  roles: WotlweduRole[];
  rolesSub: Subscription;
  hasPrevPage: boolean = false;
  hasNextPage: boolean = false;
  currentPage: number;
  roleData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private roleDataService: RoleDataService,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter( this.router );
    this.pages.setService(this.roleDataService);
    this.filter.setService(this.roleDataService);
    this.rolesSub = this.roleDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (roles) => {
        this.roles = roles;
        this.pages.updatePages();
      },
    });
    this.loader.stop();
  }

  ngOnDestroy() {
    this.rolesSub.unsubscribe();
  }

  onCancel() {
    this.pageStack.back();
  }

  onSelect(index: number) {
    this.pageStack.savePage();
    this.roleDataService.setData(this.roles[index]);
    this.router.navigate(["/","role", this.roles[index].id])
  }

  onAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/","role","add"])
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }
}
