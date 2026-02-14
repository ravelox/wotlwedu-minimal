import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";

export class WotlweduOrganization extends WotlweduMenuItem {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  creator?: string;
}

