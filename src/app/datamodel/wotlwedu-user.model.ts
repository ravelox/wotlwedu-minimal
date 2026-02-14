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
    // Legacy field, maps to system-admin behavior.
    admin?: boolean;
    systemAdmin?: boolean;
    organizationId?: string;
    organizationAdmin?: boolean;
    workgroupAdmin?: boolean;
    adminWorkgroupId?: string;
}
