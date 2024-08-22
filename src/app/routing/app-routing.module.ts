import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthComponent } from "../auth/auth.component";
import { userdataResolver } from "../resolver/userdata.resolver";
import { prefdataResolver } from "../resolver/prefdata.resolver";
import { categoryDataResolver } from "../resolver/categorydata.resolver";
import { roleDataResolver } from "../resolver/roledata.resolver";
import { itemDataResolver } from "../resolver/itemdata.resolver";
import { imageDataResolver } from "../resolver/imagedata.resolver";
import { capsDataResolver } from "../resolver/capsdata.resolver";
import { electionDataResolver } from "../resolver/electiondata.resolver";
import { AuthGuard } from "../guard/auth.guard";
import { AdminGuard } from "../guard/admin.guard";
import { groupsDataResolver } from "../resolver/groupsdata.resolver";
import { listDataResolver } from "../resolver/listdata.resolver";
import { Verify2FAComponent } from "../twofactor/verify/verify2fa.component";
import { Enable2FAComponent } from "../twofactor/enable2fa/enable2fa.component";
import { RegisterComponent } from "../register/register.component";
import { PasswordResetComponent } from "../password/password-reset/password-reset.component";
import { PasswordRequestComponent } from "../password/password-request/password-request.component";
import { UserProfileComponent } from "../userprofile/userprofile.component";
import { HomeComponent} from "../home/home.component";
import { UserDetailComponent } from "../user/user-detail/user-detail.component";
import { UserComponent } from "../user/user.component";
import { NotificationSelectComponent } from "../notification/notification-select/notification-select.component";
import { PreferenceSelectComponent } from "../preference/preference-select/preference-select.component";
import { PreferenceDetailComponent } from "../preference/preference-detail/preference-detail.component";
import { GroupDetailComponent } from "../group/group-detail/group-detail.component";
import { FriendSelectComponent } from "../friend/friend-select/friend-select.component";
import { CategoryDetailComponent } from "../category/category-detail/category-detail.component";
import { CategorySelectComponent } from "../category/category-select/category-select.component";
import { ItemDetailComponent } from "../item/item-detail/item-detail.component";
import { ItemSelectComponent } from "../item/item-select/item-select.component";
import { GroupSelectComponent } from "../group/group-select/group-select.component";
import { ImageDetailComponent } from "../image/image-detail/image-detail.component";
import { ImageSelectComponent } from "../image/image-select/image-select.component";
import { ListDetailComponent } from "../list/list-detail/list-detail.component";
import { ListSelectComponent } from "../list/list-select/list-select.component";
import { ElectionSelectComponent } from "../election/election-select/election-select.component";
import { ElectionDetailComponent } from "../election/election-detail/election-detail.component";
import { VotingComponent } from "../voting/voting.component";
import { RoleDetailComponent } from "../role/role-detail/role-detail.component";
import { RoleSelectComponent } from "../role/role-select/role-select.component";
import { ErrorComponent } from "../error/error.component";

const routes: Routes = [
  {
    path: "user/add",
    component: UserDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "user/:userId",
    component: UserDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "user",
    resolve: { users: userdataResolver },
    component: UserComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: "friend", component: FriendSelectComponent, canActivate: [AuthGuard] },
  {
    path: "notification",
    component: NotificationSelectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "preference/add",
    component: PreferenceDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "preference/:preferenceId",
    component: PreferenceDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "preference",
    resolve: { preferences: prefdataResolver },
    component: PreferenceSelectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "role/add",
    component: RoleDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "role/:roleId",
    component: RoleDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "role",
    resolve: { roles: roleDataResolver, caps: capsDataResolver },
    component: RoleSelectComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "group/add",
    component: GroupDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "group/:groupId",
    component: GroupDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "group",
    resolve: { groups: groupsDataResolver },
    component: GroupSelectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "category/add",
    component: CategoryDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "category/:categoryId",
    component: CategoryDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "category",
    resolve: { categories: categoryDataResolver },
    component: CategorySelectComponent,
    canActivate: [AuthGuard],
  },  {
    path: "item/add",
    component: ItemDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "item/:itemId",
    component: ItemDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "item",
    resolve: { items: itemDataResolver },
    component: ItemSelectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "image/add",
    component: ImageDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "image/:imageId",
    component: ImageDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "image",
    resolve: { images: imageDataResolver },
    component: ImageSelectComponent,
    canActivate: [AuthGuard],
  },  {
    path: "list/add",
    component: ListDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "list/:listId",
    component: ListDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "list",
    resolve: { lists: listDataResolver },
    component: ListSelectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "election/add",
    component: ElectionDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "election/:electionId",
    component: ElectionDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "election",
    resolve: { elections: electionDataResolver },
    component: ElectionSelectComponent,
    canActivate: [AuthGuard],
  },
  { path: "pwdreset/:userid/:resettoken", component: PasswordResetComponent },
  { path: "pwdrequest", component: PasswordRequestComponent },
  {
    path: "auth/verify/:userid/:verificationtoken",
    component: Verify2FAComponent,
  },
  {
    path: "cast-vote",
    component: VotingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: "register", component: RegisterComponent },
  { path: "confirm/:registertoken", component: RegisterComponent },
  { path: "2fa", component: Enable2FAComponent, canActivate: [AuthGuard] },
  { path: "auth", component: AuthComponent },

  { path: "home", component: HomeComponent, canActivate: [AuthGuard] },
  { path: "error", component: ErrorComponent},
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "**", redirectTo: "/home", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
