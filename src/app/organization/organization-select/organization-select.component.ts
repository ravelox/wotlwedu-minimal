import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, Subscription } from "rxjs";

import { WotlweduOrganization } from "../../datamodel/wotlwedu-organization.model";
import { OrganizationDataService } from "../../service/organizationdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduContextOption } from "../../datamodel/wotlwedu-context-option.model";
import { WotlweduContextController } from "../../controller/wotlwedu-context-controller.class";
import { DataSignalService } from "../../service/datasignal.service";
import { Router } from "@angular/router";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { TokenDataStorageService } from "../../service/tokendata.service";

@Component({
  selector: "app-organization-select",
  templateUrl: "./organization-select.component.html",
  styleUrl: "./organization-select.component.css",
})
export class OrganizationSelectComponent implements OnInit, OnDestroy {
  organizations: WotlweduOrganization[];
  organizationsSub: Subscription;
  preferenceData = new Subject<any>();
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  contextMenu: WotlweduContextController = new WotlweduContextController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  isSystemAdmin: boolean = false;

  private deleteContextOptions: WotlweduContextOption[] = [
    {
      name: "Delete",
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(
    private tokenDataService: TokenDataStorageService,
    private organizationDataService: OrganizationDataService,
    private dataSignalService: DataSignalService,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.isSystemAdmin = this.tokenDataService.getSystemAdmin() === true;
    this.loader.start();
    this.pages.setService(this.organizationDataService);
    this.filter.setService(this.organizationDataService);
    this.pageStack.setRouter(this.router);
    this.organizationsSub = this.organizationDataService.dataChanged.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (organizations) => {
        this.organizations = organizations;
        this.pages.updatePages();
        this.loader.stop();
      },
    });
  }

  ngOnDestroy() {
    if (this.organizationsSub) this.organizationsSub.unsubscribe();
  }

  onSelect(index: number) {
    this.organizationDataService.setData(this.organizations[index]);
    this.pageStack.savePage();
    this.router.navigate(["/", "organization", this.organizations[index].id]);
  }

  onAdd() {
    if (this.isSystemAdmin !== true) return;
    this.pageStack.savePage();
    this.router.navigate(["/", "organization", "add"]);
  }

  onCancel() {
    this.pageStack.back();
  }

  onContextMenu(event, index: number) {
    event.preventDefault();
    if (this.isSystemAdmin !== true) return;

    this.contextMenu.closeDown();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);

    this.contextMenu.getMousePosition(event);

    const objectData = { index: index };
    this.contextMenu.setObjectId(this.organizations[index].id);
    this.contextMenu.setObjectData(objectData);

    const menuOptions = [].concat(this.deleteContextOptions);

    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    if (object && object.id) {
      const organizationId = object.id;

      if (organizationId) {
        this.loader.start();
        this.organizationDataService.deleteOrganization(organizationId).subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: () => {
            this.organizationDataService.getAllData();
            this.loader.stop();
          },
        });
      }
    }

    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }
}

