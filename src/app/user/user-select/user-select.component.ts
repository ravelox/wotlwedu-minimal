import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UserDataService } from "../../service/userdata.service";
import { WotlweduUser } from "../../datamodel/wotlwedu-user.model";
import { BehaviorSubject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { DataSignalService } from "../../service/datasignal.service";

@Component({
  selector: "app-user-select",
  templateUrl: "./user-select.component.html",
  styleUrl: "./user-select.component.css",
})
export class UserSelectComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() selectMode: boolean = false;
  users: WotlweduUser[];
  usersSub: Subscription;
  userData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  @ViewChild("userselectlist") userSelectList: ElementRef;

  constructor(
    private userDataService: UserDataService,
    private router: Router,
    private pageStack: WotlweduPageStackService,
    private selectionService: WotlweduSelectionService,
    private dataSignalService: DataSignalService
  ) {}

  ngOnInit() {
    this.pageStack.setRouter(this.router);
    this.filter.setService(this.userDataService);
    this.pages.setService(this.userDataService);
    this.usersSub = this.userDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (users) => {
        this.users = users;
        this.users.forEach((x) => {
          x.isAvailable = true;
          if (this.selectMode === true) {
            if (this.selectionService.find(x.id)) {
              x.isSelected = true;
            }
          }
        });
        this.pages.updatePages();
      },
    });
    this.dataSignalService.refreshDataSignal.subscribe({
      next: () => {
        this.userDataService.getAllData();
      },
    });
    this.userDataService.reset();
  }

  ngOnDestroy() {
    this.usersSub.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.selectMode === true) {
      this.userSelectList.nativeElement.style.height = "40svh";
    }
  }

  onSelect(index: number) {
    if (this.selectMode === false) {
      this.userDataService.setData(this.users[index]);
      this.pageStack.savePage();
      this.router.navigate(["/", "user", this.users[index].id]);
    } else {
      this.users[index].isSelected = !this.users[index].isSelected;

      if (this.users[index].isSelected) {
        this.selectionService.push("user", this.users[index].id);
      } else {
        this.selectionService.removeId(this.users[index].id);
      }
    }
  }

  onClickSelect() {
    this.selectionService.dump();
  }

  onCancel() {
    this.selectionService.reset();
    this.pageStack.back();
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }

  onAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/", "user", "add"]);
  }
}
