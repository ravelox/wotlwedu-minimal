import { WotlweduCategory } from "./wotlwedu-category.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";
import { WotlweduUser } from "./wotlwedu-user.model";

export class WotlweduGroup extends WotlweduMenuItem{
    id: string;
    name: string;
    description: string;
    users: WotlweduUser[];
    category: WotlweduCategory;
}