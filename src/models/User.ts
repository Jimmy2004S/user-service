export interface User {
  uuid: string;
  name: string;
  lastName: string;
  email: string;
  password: string; // hashed
  document: string;
  address?: string;
  phone?: string;
  image?: string;
  createdAt: string;
}
