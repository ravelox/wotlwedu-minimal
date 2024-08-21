import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { UserDataService } from "../../service/userdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduPageStackService } from "../../service/pagestack.service";

@Component({
  selector: "app-friend-add",
  templateUrl: "./friend-add.component.html",
  styleUrl: "./friend-add.component.css",
})
export class FriendAddComponent implements OnInit, AfterViewInit {
  @ViewChild("inputEmailAddress") inputEmailAddress: ElementRef;
  @Output() closeAdd = new EventEmitter<void>();
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private userDataService: UserDataService,
    private dataSignalService: DataSignalService,
    private pageStack: WotlweduPageStackService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.inputEmailAddress) {
      this.inputEmailAddress.nativeElement.focus();
    }
  }
  onClose() {
    /* Don't close the add box if an alert is being displayed */
    if (!this.alertBox.errorMessage) {
      this.closeAdd.emit();
    }
  }

  onSubmit(f: NgForm) {
    this.userDataService.addFriendByEmail(f.value.email).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: () => {
        this.dataSignalService.refreshData();
        this.onClose();
      },
    });
  }
}
