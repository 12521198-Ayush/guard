import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken: unknown;
      refreshToken: unknown;
      id: number;
      name: string;
      email: string;
    };
  }
}
