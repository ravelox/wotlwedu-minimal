import { WotlweduMenuItem } from './wotlwedu-menu-item.model';
import { WotlweduStatus } from './wotlwedu-status.model';
import { WotlweduUser } from './wotlwedu-user.model';

export class WotlweduFriend extends WotlweduMenuItem {
  id: string;
  status: WotlweduStatus;
  user: WotlweduUser;
}
