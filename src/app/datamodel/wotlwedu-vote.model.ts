import { WotlweduElection } from "./wotlwedu-election.model";
import { WotlweduItem } from "./wotlwedu-item.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";
import { WotlweduStatus } from "./wotlwedu-status.model";
import { WotlweduUser } from "./wotlwedu-user.model";

export class WotlweduVote extends WotlweduMenuItem {
    id: string;
    election: WotlweduElection;
    status: WotlweduStatus;
    item: WotlweduItem;
    user: WotlweduUser;
}