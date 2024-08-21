import { WotlweduCap } from "./wotlwedu-cap.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";
import { WotlweduUser } from "./wotlwedu-user.model";

export class WotlweduRole extends WotlweduMenuItem{
    id: string;
    name: string;
    description: string;
    protected: boolean;
    capabilities: WotlweduCap[];
    users: WotlweduUser[];
}