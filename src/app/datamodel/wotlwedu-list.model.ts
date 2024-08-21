import { WotlweduItem } from "./wotlwedu-item.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";

export class WotlweduList extends WotlweduMenuItem {
    id: string;
    name: string;
    description: string;
    items: WotlweduItem[];
}