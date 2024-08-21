import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./routing/app-routing.module";
import { AuthComponent } from "./auth/auth.component";
import { AuthDataService } from "./service/authdata.service";
import { AuthInterceptorProvider } from "./interceptor/auth-interceptor.service";
import { CapSelectComponent } from "./cap/cap-select.component";
import { CategoryDetailComponent } from "./category/category-detail/category-detail.component";
import { CategorySelectComponent } from "./category/category-select/category-select.component";
import { ContextComponent } from "./context/context.component";
import { VotingComponent } from "./voting/voting.component";
import { VotingElectionSelectComponent } from "./voting/voting-election-select/voting-election-select.component";
import { ElectionDetailComponent } from "./election/election-detail/election-detail.component";
import { ElectionSelectComponent } from "./election/election-select/election-select.component";
import { Enable2FAComponent } from "./twofactor/enable2fa/enable2fa.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FriendAddComponent } from "./friend/friend-add/friend-add.component";
import { FriendMiniComponent } from "./friend/friend-mini/friend-mini.component";
import { FriendSelectComponent } from "./friend/friend-select/friend-select.component";
import { GroupDetailComponent } from "./group/group-detail/group-detail.component";
import { GroupSelectComponent } from "./group/group-select/group-select.component";
import { HttpClientModule } from "@angular/common/http";
import { ImageDetailComponent } from "./image/image-detail/image-detail.component";
import { ImageSelectComponent } from "./image/image-select/image-select.component";
import { ImageSelectMiniComponent } from "./image/image-select-mini/image-select-mini.component";
import { ItemDetailComponent } from "./item/item-detail/item-detail.component";
import { ItemSelectComponent } from "./item/item-select/item-select.component";
import { ListDetailComponent } from "./list/list-detail/list-detail.component";
import { ListSelectComponent } from "./list/list-select/list-select.component";
import { ModalAlertComponent } from "./modal/modal-alert/modal-alert.component";
import { ModalDialogComponent } from "./modal/modal-dialog/modal-dialog.component";
import { ModalLoaderComponent } from "./modal/modal-loader/modal-loader.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { NotificationSelectComponent } from "./notification/notification-select/notification-select.component";
import { PasswordRequestComponent } from "./password/password-request/password-request.component";
import { PasswordResetComponent } from "./password/password-reset/password-reset.component";
import { PreferenceComponent } from "./preference/preference.component";
import { PreferenceDetailComponent } from "./preference/preference-detail/preference-detail.component";
import { PreferenceSelectComponent } from "./preference/preference-select/preference-select.component";
import { RegisterComponent } from "./register/register.component";
import { RegisterService } from "./service/register.service";
import { RoleComponent } from "./role/role.component";
import { RoleDetailComponent } from "./role/role-detail/role-detail.component";
import { RoleSelectComponent } from "./role/role-select/role-select.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { TokenDataStorageService } from "./service/tokendata.service";
import { UserComponent } from "./user/user.component";
import { UserDetailComponent } from "./user/user-detail/user-detail.component";
import { UserSelectComponent } from "./user/user-select/user-select.component";
import { Verify2FAComponent } from "./twofactor/verify/verify2fa.component";
import { VoteCastComponent } from "./voting/vote-cast/vote-cast.component";
import { UserProfileComponent } from "./userprofile/userprofile.component";
import { Verify2FAMiniComponent } from "./twofactor/verify-mini/verify2fa-mini.component";
import { ListViewerComponent } from "./list/list-viewer/list-viewer.component";
import { ItemViewerComponent } from "./item/item-viewer/item-viewer.component";
import { ImageViewerComponent } from "./image/image-viewer/image-viewer.component";
import { HeaderComponent } from "./header/header.component";
import { ErrorComponent } from './error/error.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    CapSelectComponent,
    CategoryDetailComponent,
    CategorySelectComponent,
    ContextComponent,
    VotingComponent,
    VotingElectionSelectComponent,
    VoteCastComponent,
    ElectionDetailComponent,
    ElectionSelectComponent,
    Enable2FAComponent,
    FriendAddComponent,
    FriendMiniComponent,
    FriendSelectComponent,
    GroupDetailComponent,
    GroupSelectComponent,
    ImageDetailComponent,
    ImageSelectComponent,
    ImageSelectMiniComponent,
    ItemDetailComponent,
    ItemSelectComponent,
    ListDetailComponent,
    ListSelectComponent,
    ModalAlertComponent,
    ModalDialogComponent,
    ModalLoaderComponent,
    NavbarComponent,
    NotificationSelectComponent,
    PasswordRequestComponent,
    PasswordResetComponent,
    PreferenceComponent,
    PreferenceDetailComponent,
    PreferenceSelectComponent,
    RegisterComponent,
    RoleComponent,
    RoleDetailComponent,
    RoleSelectComponent,
    StatisticsComponent,
    UserComponent,
    UserDetailComponent,
    UserSelectComponent,
    Verify2FAComponent,
    UserProfileComponent,
    Verify2FAMiniComponent,
    ListViewerComponent,
    ItemViewerComponent,
    ImageViewerComponent,
    HeaderComponent,
    ErrorComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  providers: [
    AuthDataService,
    TokenDataStorageService,
    AuthInterceptorProvider,
    RegisterService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
