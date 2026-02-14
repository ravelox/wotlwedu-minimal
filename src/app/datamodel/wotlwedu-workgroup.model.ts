import { WotlweduCategory } from "./wotlwedu-category.model";
import { WotlweduMenuItem } from "./wotlwedu-menu-item.model";
import { WotlweduUser } from "./wotlwedu-user.model";

export class WotlweduWorkgroup extends WotlweduMenuItem {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  listType?: string;
  category?: WotlweduCategory;
  users?: WotlweduUser[];
  creator?: string;
}

