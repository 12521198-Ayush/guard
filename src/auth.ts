import NextAuth from "next-auth"
import { cookies, headers } from "next/headers"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PRIVATE_ROUTES as privateRoutes } from "@/constants/ROUTES"
import { signOut } from 'next-auth/react';
import { getRefreshToken } from './getRefreshToken';

// @ts-ignore

async function refreshAccessToken(token) {
  console.log("Starting refreshAccessToken with token:", token);
  try {
    const refreshCookieName = `${process.env.NODE_ENV === "production" ? "__Pro-" : ""}xxx.guard-refresh`;
    console.log("refreshCookieName", refreshCookieName);
    const refreshTokenCookie = cookies().get(refreshCookieName)?.value;
    console.log("refreshTokenCookie", refreshTokenCookie);

    if (!refreshTokenCookie) {
      console.error("Refresh token cookie not found");
      throw new Error("Missing refresh token");
    }
    console.log("Fetching new token from /api/auth/refresh");
    const payload = {refreshTokenCookie};
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const { success, status, data } = await res.json()
    console.log("Refresh response:", { success, status, data });

    if (!success) {
      console.log("Token refresh failed!");
      throw data
    }

    if (status === 422 || status === 401) {
      console.log("Token refresh error with status:", status);
      throw new Error("The token could not be refreshed", status);
    }

    if (data.error) {
      console.log("Token refresh error:", data.error);
      throw new Error(data.error);
    }

    console.log("Token refreshed successfully");
    console.log("Decoding new access token");
    const decodedAccessToken = JSON.parse(Buffer.from(data.data.accessToken.split(".")[1], "base64").toString())
    console.log("Decoded access token:", decodedAccessToken);

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
      idToken: data.data.idToken,
      accessTokenExpires: decodedAccessToken["exp"] * 1000,
      error: "",
    }
  } catch (error) {
    console.log("Error in refreshAccessToken:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const config = {
  trustHost: true,

  providers: [
    CredentialsProvider({
      credentials: {
        access_token: { label: "access_token", type: "text", placeholder: "access_token" },
        refresh_token: { label: "refresh_token", type: "text", placeholder: "refresh_token" }
      },

      async authorize(credentials, req): Promise<any> {
        console.log("Starting authorization process...");

        const tokens = {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token
        };

        if (!tokens.accessToken) {
          console.error("Authorization failed: Missing access token");
          throw new Error("Access token is not available");
        }
        if (!tokens.refreshToken) {
          console.error("Authorization failed: Missing refresh token");
          throw new Error("Refresh token is not available");
        }

        const apiEndpoint = "https://api.servizing.app/user-service/karyakarta/data";
        console.log("Making API request to:", apiEndpoint);

        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        console.log("Received API response, status:", res.status);

        const userData = await res.json();
        console.log("User data from API:", userData);

        if (!res.ok) {
          console.error("API request failed:", userData.error?.message);
          throw new Error(userData.error.message);
        }

        console.log("Processing user data...");
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        console.log("Calculated token expiration:", expiration.toISOString());

        const premise = userData.data[0].premise_id;
        const sub_premise = userData.data[0].sub_premise_id;
        const user = {
          security_guard_id: userData.data[0].security_guard_id,
          security_guard_fcmid: userData.data[0].security_guard_fcmid,
          primary_premise_id: premise,
          premises_associated_with: userData.data,
          sub_premise_id: sub_premise,
          premise_unit_id: userData.data[0].premise_unit_id,
          skill: userData.data[0].skill,
          primary_premise_name: userData.data[0].premise_name,
          registration_reference: userData.data[0].registration_reference,
          registration_status: userData.data[0].registration_status,
          name: userData.data[0].name,
          role: userData.data[0].association_type,
          admin_email: userData.data[0].email,
          phone: userData.data[0].mobile,
          img: "/avatar.png",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          exp: expiration.toISOString(),
        };

        if (res.ok && user) {
          const prefix = process.env.NODE_ENV === "production" ? "__Pro-" : "";
          console.log("Setting refresh token cookie with prefix:", prefix);
          try {
            cookies().set({
              name: `${prefix}xxx.guard-refresh`,
              value: user.refreshToken,
              httpOnly: true,
              sameSite: "lax",
              secure: true,
              domain: ".servizing.app",
              path: "/",
            } as any);
            console.log("Refresh token cookie set successfully");
          } catch (error) {
            console.error("Failed to set refresh token cookie:", error);
          }

          console.log("Authorization successful, returning user");
          return user;
        }
        console.log("Authorization failed, returning null");
        return null;
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/nativeRedirect/logout",
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      console.log("JWT callback triggered");

      if (account && user) {
        console.log("Populating token with user data...");
        token.id = user.id;
        token.name = user.name;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.phone = user.phone;
        token.skill = user.skill;
        token.security_guard_fcmid = user.security_guard_fcmid;
        token.security_guard_id = user.security_guard_id;
        token.premises_associated_with = user.premises_associated_with;
        token.registration_status = user.registration_status;
        token.registration_reference = user.registration_reference;
        token.admin_email = user.admin_email;
        token.role = user.role;
        token.primary_premise_id = user.primary_premise_id;
        token.sub_premise_id = user.sub_premise_id;
        token.premise_unit_id = user.premise_unit_id;
        token.primary_premise_name = user.primary_premise_name;
        token.premises_associated_with = user.premises_associated_with;

        console.log("Decoding access token...");
        const decodedAccessToken = JSON.parse(Buffer.from(user.accessToken.split(".")[1], "base64").toString());
        console.log("Decoded access token:", decodedAccessToken);

        if (decodedAccessToken) {
          token.email = decodedAccessToken["email"];
          token.userId = decodedAccessToken["sub"];
          token.societyList = decodedAccessToken["society_array"];
          token.accessTokenExpires = decodedAccessToken["exp"] * 1000;
          token.picture = decodedAccessToken["picture"] ?? '/avatar.png';
        }
      }

      if (trigger === 'update' && session) {
        console.log("Updating token with session data...");
        token.primary_premise_id = session.primary_premise_id ?? token.primary_premise_id;
        token.primary_premise_name = session.primary_premise_name ?? token.primary_premise_name;
        token.premise_unit_id = session.premise_unit_id ?? token.premise_unit_id;
        token.sub_premise_id = session.sub_premise_id ?? token.sub_premise_id;
        token.role = session.role ?? token.role;
        console.log("Token after session update:", token);
      }

      if (token.accessTokenExpires && (Date.now() < Number(token.accessTokenExpires))) {
        console.log("Access token is still valid, expires at:", new Date(Number(token.accessTokenExpires)));
        const { refreshToken, ...rest } = token;
        console.log("Returning valid token without refresh token:", rest);
        return rest;
      }

      console.log("Access token expired, initiating refresh...");
      const refreshedToken = await refreshAccessToken(token);
      console.log("Token after refresh attempt:", refreshedToken);
      return refreshedToken;
    },

    async session({ session, token }) {
      console.log("Session callback triggered");

      const mySession = {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          admin_email: token.admin_email as string,
          phone: token.phone as string,
          societyList: token.societyList as string[],
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          premise_unit_id: token.premise_unit_id as any,
          sub_premise_id: token.sub_premise_id as any,
          security_guard_fcmid: token.security_guard_fcmid as any,
          security_guard_id: token.security_guard_id as any,
          accessTokenExpires: token.accessTokenExpires as number,
          skill: token.skill as string,
          role: token.role as string,
          primary_premise_id: token.primary_premise_id as string,
          primary_premise_name: token.primary_premise_name as string,
          premises_associated_with: token.premises_associated_with as string[],
        },
        error: token.error,
      };
      console.log("Constructed session object:", mySession);
      return mySession;
    },

    authorized({ request, auth }) {
      console.log("Authorized callback triggered");
      console.log("Request URL:", request.nextUrl.pathname);
      console.log("Auth status:", !!auth);

      const { pathname } = request.nextUrl;
      const searchTerm = request.nextUrl.pathname.split("/").slice(0, 2).join("/");
      console.log("Checking route:", searchTerm);

      if (privateRoutes.includes(searchTerm)) {
        console.log("Private route detected, auth required");
        return !!auth;
      } else if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/signup")) {
        const isLoggedIn = !!auth;
        console.log("Public auth route detected, isLoggedIn:", isLoggedIn);
        if (isLoggedIn) {
          console.log("User is logged in, redirecting to /menu");
          return Response.redirect(new URL("/menu", request.nextUrl));
        }
        console.log("Allowing access to public auth route");
        return true;
      }
      console.log("Allowing access to public route");
      return true;
    },
  },
  debug: process.env.NODE_ENV === "production",
} satisfies NextAuthConfig;

export const { auth, handlers } = NextAuth(config);