import { WotlweduImage } from "./wotlwedu-image.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";

export class WotlweduUser extends WotlweduMenuItem {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    alias: string;
    email: string;
    image?: WotlweduImage;
    active?: boolean;
    verified?: boolean;
    enable2fa?: boolean;
    admin?: boolean;
}