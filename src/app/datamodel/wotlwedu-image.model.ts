import { WotlweduCategory } from "./wotlwedu-category.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";

export class WotlweduImage extends WotlweduMenuItem{
    id: string;
    workgroupId?: string;
    contentType: string;
    description: string;
    name: string;
    filename: string;
    category?: WotlweduCategory;
    url: string;
}
