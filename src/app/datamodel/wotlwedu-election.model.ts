import { WotlweduCategory } from "./wotlwedu-category.model";
import { WotlweduGroup } from "./wotlwedu-group.model";
import { WotlweduImage } from "./wotlwedu-image.model";
import { WotlweduList } from "./wotlwedu-list.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";
import { WotlweduStatus } from "./wotlwedu-status.model";

export class WotlweduElection extends WotlweduMenuItem {
    id: string;
    name: string;
    description: string;
    text: string;
    electionType: number;
    expiration: Date;
    statusId: number;
    status: WotlweduStatus;
    list: WotlweduList;
    group: WotlweduGroup;
    category: WotlweduCategory;
    image: WotlweduImage;
}