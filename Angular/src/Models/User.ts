export interface UserStyle {
  bold?: boolean;
}

export interface User {
  id: number;
  rank: number;
  username: string;
  style?: UserStyle;
}
