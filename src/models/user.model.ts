export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
};

export type DetailUser = AuthUser & {
  isAdmin: boolean;
  address: string;
  phoneNumber: string;
  photo: string;
  likes: string[];
};
