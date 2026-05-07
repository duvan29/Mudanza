export interface IUser {
  _id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

export interface IUserPublic {
  _id: string;
  email: string;
  displayName: string;
}
