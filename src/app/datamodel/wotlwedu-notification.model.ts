import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";
import { WotlweduStatus } from "./wotlwedu-status.model";
import { WotlweduUser } from "./wotlwedu-user.model";

export class WotlweduNotification extends WotlweduMenuItem{
    id: string;
    type: number;
    objectId: string;
    status: WotlweduStatus;
    text: string;
    user: WotlweduUser;
    sender: WotlweduUser;
    createdAt: string;
}
