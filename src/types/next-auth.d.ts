import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    driverId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      driverId: string | null;
    } & DefaultSession["user"];
  }
}
