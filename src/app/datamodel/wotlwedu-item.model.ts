import { WotlweduCategory } from "./wotlwedu-category.model";
import { WotlweduImage } from "./wotlwedu-image.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";

export class WotlweduItem extends WotlweduMenuItem{
    id: string;
    name: string;
    description: string;
    url: string;
    location: string;
    image: WotlweduImage;
    category: WotlweduCategory;
}