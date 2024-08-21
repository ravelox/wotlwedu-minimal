import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduElection } from "../../datamodel/wotlwedu-election.model";
import { ElectionDataService } from "../../service/electiondata.service";
import { ListDataService } from "../../service/listdata.service";
import { WotlweduList } from "../../datamodel/wotlwedu-list.model";
import { GroupDataService } from "../../service/groupdata.service";
import { WotlweduGroup } from "../../datamodel/wotlwedu-group.model";
import { WotlweduImage } from "../../datamodel/wotlwedu-image.model";
import { ImageDataService } from "../../service/imagedata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { SharedDataService } from "../../service/shareddata.service";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduPageStackService } from "../../service/pagestack.service";

@Component({
  selector: "app-election-detail",
  templateUrl: "./election-detail.component.html",
  styleUrl: "./election-detail.component.css",
})
export class ElectionDetailComponent implements OnInit, OnDestroy {
  electionSub: Subscription = null;
  listSub: Subscription = null;
  groupSub: Subscription = null;
  currentElection: WotlweduElection = null;
  electionDetailForm: FormGroup;
  filterForm: FormGroup;
  editMode: boolean = false;
  currentLists: WotlweduList[];
  currentGroups: WotlweduGroup[];
  currentImage: WotlweduImage = null;
  imageSelectorVisible: boolean = false;
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private electionDataService: ElectionDataService,
    private listDataService: ListDataService,
    private groupDataService: GroupDataService,
    private imageDataService: ImageDataService,
    private dataSignalService: DataSignalService,
    private sharedDataService: SharedDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.electionSub = this.electionDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (election: WotlweduElection) => {
        if (election) {
          this.currentElection = election;
          this.editMode = true;
          this.initForm();
        }
      },
    });

    this.listSub = this.listDataService.dataChanged.subscribe(
      (lists: WotlweduList[]) => {
        this.currentLists = lists;
      }
    );

    this.groupSub = this.groupDataService.dataChanged.subscribe(
      (groups: WotlweduGroup[]) => {
        this.currentGroups = groups;
      }
    );

    if( this.route.snapshot.params.electionId ) {
      this.loader.start();
      this.electionDataService.getData( this.route.snapshot.params.electionId ).subscribe({
        error: (err)=>{
          this.loader.stop();
          this.alertBox.handleError(err);
        },
        next: (response)=>{
          if( response && response.data && response.data.election ) {
            this.electionDataService.setElectionDetails( response.data.election);
          }
          this.loader.stop();
        }
      })
    }
    this.dataSignalService.refreshData();
    this.initForm();
    this.loader.stop();
  }

  ngOnDestroy() {
    if (this.listSub) this.listSub.unsubscribe();
    if (this.groupSub) this.groupSub.unsubscribe();
    if (this.electionSub) this.electionSub.unsubscribe();
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
      const electionId = object.id;
      this.deleteElection(electionId);
      this.onCancel();
    }

    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSubmit() {
    let election = new WotlweduElection();

    let electionId = null;
    if (this.electionDetailForm.value.electionId) {
      electionId = this.electionDetailForm.value.electionId;
    }
    const name = this.electionDetailForm.value.name;
    const description = this.electionDetailForm.value.description;
    const groupId = this.electionDetailForm.value.groupId;
    const listId = this.electionDetailForm.value.listId;
    let expiration: Date;

    election.id = electionId;
    election.name = name;
    election.description = description;

    election.group = new WotlweduGroup();
    election.group.id = groupId ? groupId : null;

    election.list = new WotlweduList();
    election.list.id = listId ? listId : null;
    if (this.currentImage) {
      election.image = new WotlweduImage();
      election.image.id = this.currentImage.id;
    } else {
      election.image = null;
    }

    /* In case no expiration is provided, we will use the default duration specified by the
    user otherwise we will expire the election after 7 days */
    let defaultExpiration: number =
      +this.sharedDataService.getPreference("defaultexpiration");
    if (!defaultExpiration) {
      defaultExpiration = 7;
    }
    if (this.electionDetailForm.value.expiration) {
      expiration = new Date(this.electionDetailForm.value.expiration);
    } else {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + defaultExpiration);
    }
    election.expiration = new Date(expiration);

    /* Update the election */
    this.loader.start();
    this.electionDataService.saveElection(election).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.electionDataService.getAllData();
        this.onCancel();
      },
    });
  }

  initForm() {
    let electionId = "";
    let name = "";
    let description = "";
    let listId = "";
    let groupId = "";
    let expiration = null;

    this.listDataService.getAllData();

    if (this.currentElection) {
      electionId = this.currentElection.id;
      name = this.currentElection.name;
      description = this.currentElection.description;
      if (this.currentElection.list) {
        listId = this.currentElection.list.id;
      }
      if (this.currentElection.group) {
        groupId = this.currentElection.group.id;
      }
      this.currentImage = this.currentElection.image
        ? this.currentElection.image
        : null;

      /* Mariadb stores dates as UTC so we need to do some date 
        math based on local timezone to present the correct time */
      if (this.currentElection.expiration) {
        const timeZoneOffset = new Date().getTimezoneOffset();
        const localTime = new Date(
          new Date(this.currentElection.expiration).getTime() -
            timeZoneOffset * 60000
        );
        /* Javascript is picky about date format
        It needs to be yyyy-mm-dd HH:mm at least */
        expiration = localTime.toISOString().slice(0, 19).replace("T", " ");
      }
    }

    this.electionDetailForm = new FormGroup({
      electionId: new FormControl(electionId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      listId: new FormControl(listId),
      groupId: new FormControl(groupId),
      expiration: new FormControl(expiration),
    });

    // Get the list of lists
    this.listDataService.getAllData();

    // Get the list of groups
    this.groupDataService.getAllData();

    if (this.currentElection) this.electionDetailForm.markAsDirty();
  }

  onCancel() {
    this.loader.stop();
    this.electionDetailForm.reset();
    this.currentElection = null;
    this.currentImage = null;
    this.editMode = false;
    this.electionDataService.onCancel();
    this.pageStack.back();
  }

  deleteElection(electionId: string) {
    if (!electionId) return;
    this.loader.start();
    this.electionDataService.deleteElection(electionId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.electionDataService.getAllData();
        this.onCancel();
      },
    });
  }

  onDelete() {
    this.showDeleteConfirmationDialog({
      id: this.electionDetailForm.value.electionId,
    });
  }

  onImageSelect(event: string) {
    this.imageSelectorVisible = false;
    this.loader.start();
    this.imageDataService.getData(event).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        if (response && response.data && response.data.image) {
          this.currentImage = response.data.image;
        }
      },
    });
  }

  toggleImageSelector() {
    this.imageSelectorVisible = !this.imageSelectorVisible;
  }

  onStartElection() {
    if (
      !(
        this.currentElection &&
        this.currentElection.status.name === "Not Started"
      )
    ) {
      this.alertBox.setErrorMessage("Election cannot be started");
      return;
    }

    this.loader.start();
    this.electionDataService.startElection(this.currentElection.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.electionDataService.getAllData();
      },
    });
  }

  onStopElection() {
    if (
      !(
        this.currentElection &&
        this.currentElection.status.name === "In Progress"
      )
    ) {
      this.alertBox.setErrorMessage("Election cannot be stopped");
      return;
    }

    this.loader.start();
    this.electionDataService.stopElection(this.currentElection.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.electionDataService.getAllData();
      },
    });
  }
}
