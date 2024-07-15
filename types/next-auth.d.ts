import { AuthUser } from "@/model/user";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    provider: string;
    user: AuthUser;
    accessToken: string;
    uid: string;
  }
}
