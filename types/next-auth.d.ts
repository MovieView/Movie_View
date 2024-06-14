import { AuthUser } from "@/model/user";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    // user: {
    //   username: string;
    //   email: string;
    // } & DefaultSession['user'];
    provider: string;
    user: AuthUser;
    accessToken: string;
    uid: string;
  }
}
