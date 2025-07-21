import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  user_id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: UserRole;
}
