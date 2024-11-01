export {};

declare global {
  type RegBody = {
    name: string;
    username: string;
    email: string;
    password: string;
    isAdmin?: boolean;
  };

  type LoginBody = {
    email: string;
    password: string;
  };

  type UpdateBody = {} & Partial<RegBody>;
}
