import NextAuth from "next-auth"
import { cookies, headers } from "next/headers"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PRIVATE_ROUTES as privateRoutes } from "@/constants/ROUTES"
import { signOut } from 'next-auth/react';

// @ts-ignore

let isRefreshing = false;
let refreshTokenPromise: Promise<any> | null = null;  // Holds the refresh promise while it's being executed

async function refreshAccessToken(token:any) {
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
    console.log("Decoding token 2nd ... ")
    const decodedAccessToken = JSON.parse(Buffer.from(data.data.accessToken.split(".")[1], "base64").toString())


    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
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
          refrehToken: credentials.refresh_token
        }


        const apiEndpoint =
          "http://139.84.166.124:8060/user-service/resident/data";

        if (!tokens.accessToken) {
          throw new Error("Access token is not available");
        }

        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });


        const userData = await res.json();

        if (!res.ok) {
          throw new Error(userData.error.message)
        }

        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);

        interface Premise {
          premise_id: string;
          premise_name: string;
          current_premise_name: string;
          admin_name: string;
          admin_designation: string;
          admin_email: string;
          registration_status: string;
          phone: string;
          registration_reference: string;
        }
        const premise = userData.data[0].premise_id;
        const sub_premise = userData.data[0].sub_premise_id;
        const user = {
          //isAdmin: true, 
          name: userData.data[0].name,
          role: userData.data[0].association_type,
          premise_unit_id: userData.data[0].premise_unit_id,
          admin_email: userData.data[0].email,
          phone: userData.data[0].mobile,
          registration_reference: userData.data[0].registration_reference,
          registration_status: userData.data[0].registration_status,
          current_premise_name: userData.data[0].premise_name,
          img: "/avatar.png",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refrehToken,
          exp: expiration.toISOString(),
          primary_premise_id: premise,
          sub_premise_id: sub_premise,
          primary_premise_name: "ireo",
          premises_associated_with: [],
          sub_premise_access_control_reqd: "yes",
          subpremiseArray: []
        };

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
        token.registration_status = user.registration_status;
        token.registration_reference = user.registration_reference;
        token.admin_email = user.admin_email;
        token.role = user.role; // the user role
        token.current_premise_name = user.current_premise_name;
        token.primary_premise_id = user.primary_premise_id;
        token.sub_premise_id = user.sub_premise_id;
        token.primary_premise_name = user.primary_premise_name;
        token.premises_associated_with = user.premises_associated_with;
        token.subpremiseArray = user.subpremiseArray;
        token.sub_premise_access_control_reqd = user.sub_premise_access_control_reqd;

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
      if (trigger === 'update') {
        token.current_premise_name = session.user.current_premise_name;
        token.subpremiseArray = session.user.subpremiseArray;
        token.primary_premise_id = session.user.primary_premise_id;
        token.role = session.user.role;
        token.sub_premise_access_control_reqd = session.user.sub_premise_access_control_reqd;
      }

      // If the token is not expired, return the current token
      if (token.accessTokenExpires && Date.now() < Number(token.accessTokenExpires)) {
        const { refreshToken, ...rest } = token;
        return rest;
      }

      if (isRefreshing) {
        console.log("Refresh token request is already in progress. Returning the ongoing promise.");
        return refreshTokenPromise!;
      }
    
      // Log that we're starting the refresh process
      console.log("Starting refresh token process...");
    
      // Start the refresh process
      isRefreshing = true;
      refreshTokenPromise = refreshAccessToken(token)
        .finally(() => {
          isRefreshing = false;  // Reset the flag after refresh attempt is finished
        });
    

      return refreshTokenPromise;
    },



    async session({ session, token }) {
      const mySession = {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          societyList: token.societyList as string[],
          accessToken: token.accessToken as string,
          accessTokenExpires: token.accessTokenExpires as number,
          current_premise_name: token.current_premise_name as any,
          role: token.role as string,
          primary_premise_id: token.primary_premise_id as string,
          primary_premise_name: token.primary_premise_name as string,
          premises_associated_with: token.premises_associated_with as string[],
          sub_premise_access_control_reqd: token.sub_premise_access_control_reqd as string,
          subpremiseArray: token.subpremiseArray as string[]

        },
        error: token.error,
      }
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