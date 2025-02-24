import { DrawerParamList } from "@/utils/types";

export class NavigationItem {
  label: string;
  icon: string;
  screen: keyof DrawerParamList;

  constructor(label: string, icon: string, screen: keyof DrawerParamList) {
    this.label = label;
    this.icon = icon;
    this.screen = screen;
  }
}
