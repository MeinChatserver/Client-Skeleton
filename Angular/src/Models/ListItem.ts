export interface ListItemIcon {
  url: string;
  position: number;
}

export interface ListItem {
  id?: string | number;
  label: string;
  number?: number;
  prefixIcons?: ListItemIcon[];
  suffixIcons?: ListItemIcon[];
  rank?: number;
  bold?: boolean;
}
