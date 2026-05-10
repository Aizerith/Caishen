export interface UserToken {
  sub: string;
  id: number;
  roles: string[];
  exp: Date;
  remember: boolean;
}
