export const userDtoFields = ['username', 'email', 'id', 'createdAt'] as const;
export interface UserDto {
  username: string;
  email: string;
  id: string;
  createdAt: Date;
}
