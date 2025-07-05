import NextAuth from "next-auth"
import { cookies, headers } from "next/headers"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PRIVATE_ROUTES as privateRoutes } from "@/constants/ROUTES"
import { signOut } from 'next-auth/react';

// @ts-ignore

let isRefreshing = false;
let refreshTokenPromise: Promise<any> | null = null;  // Holds the refresh promise while it's being executed

async function refreshAccessToken(token: any) {
  // this is our refresh token method
  if (!token || token.error === "RefreshAccessTokenError") {
    console.log("Refresh token is expired or error already set, not calling the API.");
    console.log("All Cookies:", cookies().getAll());
    return token; // Return the existing token without making the API call
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ userID: token.userId })
    })

    const { success, status, data } = await res.json()
    if (!success) {
      throw data
    }

    if (status === 422 || status === 401) {
      throw new Error("The token could not be refreshed", status);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    console.log("The token has been refreshed successfully.")
    // get some data from the new access token such as exp (expiration time)
    // console.log("Decoding token 2nd ... ")
    const decodedAccessToken = JSON.parse(Buffer.from(data.data.accessToken.split(".")[1], "base64").toString())


    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      idToken: data.data.idToken,
      accessTokenExpires: decodedAccessToken["exp"] * 1000,
      error: "",
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError", // attention!
    }
  }
}


export const config = {
  trustHost: true,

  providers: [
    // we use credentials provider here
    CredentialsProvider({
      credentials: {
        access_token: { label: "access_token", type: "text", placeholder: "access_token" },
        refresh_token: { label: "refresh_token", type: "text", placeholder: "refresh_token" }
      },


      async authorize(credentials, req): Promise<any> {
        const tokens = {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token
        }


        const apiEndpoint =
          "http://139.84.166.124:8060/user-service/resident/data";

        if (!tokens.accessToken) {
          throw new Error("Access token is not available");
        } 
        if (!tokens.refreshToken) {
          throw new Error("Refresh token is not available");
        }

        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });


        const userData = await res.json();
        // console.log(userData);

        if (!res.ok) {
          throw new Error(userData.error.message)
        }

        console.log("**************************************************************");
        console.log("refresh token : ");
        console.log(tokens.refreshToken);

        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);

        const premise = userData.data[0].premise_id;
        const sub_premise = userData.data[0].sub_premise_id;
        const user = {
          //isAdmin: true, 
          primary_premise_id: premise,
          premises_associated_with: userData.data,
          sub_premise_id: sub_premise,
          premise_unit_id: userData.data[0].premise_unit_id,

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

        console.log("**************************************************************")
        console.log("user object")
        console.log(user)

        if (res.ok && user) {
          const prefix = process.env.NODE_ENV === "production" ? "__Pro-" : "";
          try {
            cookies().set({
              name: `${prefix}xxx.refresh-token`,
              value: user.refreshToken,
              httpOnly: true,
              sameSite: "strict",
              secure: false,
            } as any);
          } catch (error) {
            console.error("Error setting cookie:", error);
          }

          return user;
        }
        return null
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/nativeRedirect/logout",
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // If there's a user and account, we populate the token with the user details
      if (account && user) {
        token.id = user.id;
        token.name = user.name;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.phone = user.phone;
        token.premises_associated_with = user.premises_associated_with;
        token.registration_status = user.registration_status;
        token.registration_reference = user.registration_reference;
        token.admin_email = user.admin_email;
        token.role = user.role; // the user role
        token.primary_premise_id = user.primary_premise_id;
        token.sub_premise_id = user.sub_premise_id;
        token.premise_unit_id = user.premise_unit_id;
        token.primary_premise_name = user.primary_premise_name;
        token.premises_associated_with = user.premises_associated_with;


        console.log("**************************************************************")
        console.log("token")
        console.log(token)
        // Decoding the access token
        const decodedAccessToken = JSON.parse(Buffer.from(user.accessToken.split(".")[1], "base64").toString());
        if (decodedAccessToken) {
          token.email = decodedAccessToken["email"];
          token.userId = decodedAccessToken["sub"];
          token.societyList = decodedAccessToken["society_array"];
          token.accessTokenExpires = decodedAccessToken["exp"] * 1000;
          token.picture = decodedAccessToken["picture"] ?? '/avatar.png';
        }
      }

      // If the session is being updated, we update the token accordingly
      if (trigger === 'update' && session) {
        token.primary_premise_id = session.primary_premise_id ?? token.primary_premise_id;
        token.primary_premise_name = session.primary_premise_name ?? token.primary_premise_name;
        token.premise_unit_id = session.premise_unit_id ?? token.premise_unit_id;
        token.sub_premise_id = session.sub_premise_id ?? token.sub_premise_id;
        token.role = session.role ?? token.role;
      }

      // If the token is not expired, return the current token
      if (token.accessTokenExpires && Date.now() < Number(token.accessTokenExpires)) {
        return token;
      }

      if (isRefreshing) {
        // console.log("Refresh token request is already in progress. Returning the ongoing promise.");
        return refreshTokenPromise!;
      }
      // Log that we're starting the refresh process
      // console.log("Starting refresh token process...");

      // Start the refresh process
      isRefreshing = true;
      refreshTokenPromise = refreshAccessToken(token)
        .finally(() => {
          isRefreshing = false;  // Reset the flag after refresh attempt is finished
        });


      return refreshTokenPromise;
    },

    async session({ session, token }) {
      console.log("**************************************************************")
      console.log("token object while puting refresh token in mysession")
      console.log(token)
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
          accessTokenExpires: token.accessTokenExpires as number,
          role: token.role as string,
          primary_premise_id: token.primary_premise_id as string,
          primary_premise_name: token.primary_premise_name as string,
          premises_associated_with: token.premises_associated_with as string[],
        },
        error: token.error,
      }
      console.log("**************************************************************")
      console.log("mySession object")
      console.log(mySession)
      return mySession;
    },

    authorized({ request, auth }) {

      const { pathname } = request.nextUrl
      // get the route name from the url such as "/about"
      const searchTerm = request.nextUrl.pathname.split("/").slice(0, 2).join("/")

      if (privateRoutes.includes(searchTerm)) {
        return !!auth
        // if the pathname starts with one of the routes below and the user is already logged in, forward the user to the home page
      } else if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/signup")) {
        const isLoggedIn = !!auth
        if (isLoggedIn) {
          return Response.redirect(new URL("/menu", request.nextUrl))
        }
        return true
      }
      return true
    },
  },
  debug: process.env.NODE_ENV === "production",
} satisfies NextAuthConfig;

export const { auth, handlers } = NextAuth(config);