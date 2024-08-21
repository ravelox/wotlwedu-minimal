import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UserDataService } from '../../service/userdata.service';
import { Subscription, take } from 'rxjs';
import { WotlweduFriend } from '../../datamodel/wotlwedu-friend.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';

@Component({
  selector: 'app-friend-mini',
  templateUrl: './friend-mini.component.html',
  styleUrl: './friend-mini.component.css',
})
export class FriendMiniComponent implements OnInit, OnDestroy, OnChanges {
  userSub: Subscription;
  @Input() userId: string = null;
  currentFriends: WotlweduFriend[];
  updateInProgress: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() friendselect = new EventEmitter<WotlweduUser>();
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private userDataService: UserDataService,
    private authDataService: AuthDataService
  ) {}

  ngOnInit(): void {
    if (!this.userId) {
      this.authDataService.authData.pipe(take(1)).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (authData) => {
          if (authData && authData.id) {
            this.userId = authData.id;
            this.updateFriendsList();
          }
        },
      });
    } else {
      this.updateFriendsList();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userId) {
      this.updateFriendsList();
    }
  }

  updateFriendsList() {
    if (this.updateInProgress) return;

    if (this.userId) {
      this.updateInProgress = true;
      this.userDataService.getFriends(this.userId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (friendsResponse) => {
          if (
            friendsResponse &&
            friendsResponse.data &&
            friendsResponse.data.friends
          ) {
            this.currentFriends = friendsResponse.data.friends;
            this.updateInProgress = false;
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

  onClose() {
    this.close.emit();
  }

  onContextMenu(event, index: number) {
    event.preventDefault();
  }

  onSelect(index: number) {
    if (this.currentFriends) {
      this.friendselect.emit( this.currentFriends[index].user );
      this.close.emit();
    }
  }
}
