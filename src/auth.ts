import NextAuth from "next-auth"
import { cookies, headers } from "next/headers"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PRIVATE_ROUTES as privateRoutes } from "@/constants/ROUTES"
import { createHash } from 'crypto';

// @ts-ignore

async function refreshAccessToken(token) {
    // this is our refresh token method
    // // console.log("Now refreshing the expired token...")
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ userID: token.userId })
        })

        const { success, status, data } = await res.json()
        console.log("#####################################")
        console.log("Refresh response")
        console.log(success)
        console.log(status)
        console.log(data)
        console.log("#####################################")
        if (!success) {
            console.log("The token could not be refreshed!")
            throw data
        }

        if (status === 422 || status === 401) {
            throw new Error("The token could not be refreshed", status);
        }

        if (data.error) {
            // // console.log("The token could not be refreshed!")
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
        // // console.log(error)
        // return an error if somethings goes wrong
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
                refresh_token: { label: "refresh_token", type: "text" }
            },


            async authorize(credentials, req): Promise<any> {
                console.log("authorization starts");
                
                const tokens = {
                    accessToken: credentials.access_token,
                    refrehToken: credentials.refresh_token
                }


                const apiEndpoint = "http://139.84.166.124:8060/user-service/resident/data  ";
                const res = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokens.accessToken}`,
                    },
                });

                const userData = await res.json();
                console.log(userData);
                
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
                }
                const premise = userData.data[0].premise_id;
                //   console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                //   console.log(premise)
                //   console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

                const user = {
                    //isAdmin: true, 
                    name: userData.data[0].name,
                    role: userData.data[0].association_type,  // Accessing the first element of the array
                    email: userData.data[0].email,
                    current_premise_name: "ireo",
                    img: "/avatar.png",
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refrehToken,
                    exp: expiration.toISOString(),
                    primary_premise_id: premise,
                    primary_premise_name: "ireo",
                    premises_associated_with: [],
                    sub_premise_access_control_reqd: "yes",
                    subpremiseArray: []
                };
                // console.log(user);

                if (res.ok && user) {
                    const prefix = process.env.NODE_ENV === "production" ? "__Pro-" : "";
                    // cookies().set({
                    //     name: "test-cookie",
                    //     value: "test-value",
                    //     httpOnly: true,
                    //     sameSite: "strict",
                    //     secure: true,
                    //   });
                    try {
                        cookies().set({
                            name: `${prefix}xxx.refresh-token`,
                            value: user.refreshToken,
                            httpOnly: true,
                            sameSite: "strict",
                            secure: false,
                        } as any);
                        console.log("Cookie set successfully:", `${prefix}xxx.refresh-token`);
                    } catch (error) {
                        console.error("Error setting cookie:", error);
                    }

                    return user;
                }
                return null
            }
        })
    ],
    // this is required
    secret: process.env.AUTH_SECRET,
    // our custom login page
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // // console.log("Inside JWT");
            // // console.log(token)

            if (account && user) {
                console.log("user obj", user)
                console.log("----------------------------------------------------------------------------------------");
                
                console.log("account obj", account)

                token.id = user.id,
                    token.accessToken = user.accessToken,
                    token.refreshToken = user.refreshToken,
                    token.role = user.role // the user role
                token.current_premise_name = user.current_premise_name,
                    token.primary_premise_id = user.primary_premise_id,
                    token.primary_premise_name = user.primary_premise_name,
                    token.premises_associated_with = user.premises_associated_with,
                    token.subpremiseArray = user.subpremiseArray,
                    token.sub_premise_access_control_reqd = user.sub_premise_access_control_reqd
                // // console.log("Decoding token 1st ... ")
                const decodedAccessToken = JSON.parse(Buffer.from(user.accessToken.split(".")[1], "base64").toString())
                console.log("----------------------------------------------------------------------------------------");
                console.log("decode accesstoken", decodedAccessToken);
                console.log("----------------------------------------------------------------------------------------");

                
                // // console.log("Decoded token 1st ... ")
                if (decodedAccessToken) {
                    token.email = decodedAccessToken["email"] as string
                    token.userId = decodedAccessToken["sub"] as string
                    token.societyList = decodedAccessToken["society_array"] as string[]
                    token.accessTokenExpires = decodedAccessToken["exp"] * 1000
                    token.picture = decodedAccessToken["picture"] ?? '/avatar.png'
                }
            }


            if (trigger === 'update') {
                token.current_premise_name = session.user.current_premise_name,
                    token.subpremiseArray = session.user.subpremiseArray
                token.primary_premise_id = session.user.primary_premise_id,
                    token.role = session.user.role,
                    token.sub_premise_access_control_reqd = session.user.sub_premise_access_control_reqd
                token.subpremiseArray = session.user.subpremiseArray
            }

            // if our access token has not expired yet, return all information except the refresh token
            if (token.accessTokenExpires && (Date.now() < Number(token.accessTokenExpires))) {
                const { refreshToken, ...rest } = token
                // // console.log(" *** Access token valid *** ");
                return rest
            }

            //if our access token has expired, refresh it and return the result
            // // console.log("Token expired calling refresh token...");
            return await refreshAccessToken(token)

        },

        async session({ session, token }) {
            //console.log("session => ", session)
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
                csrf: true,
            }
            //console.log("session => ", mySession);
            return mySession;
        },
        authorized({ request, auth }) {

            const { pathname } = request.nextUrl
            // get the route name from the url such as "/about"
            const searchTerm = request.nextUrl.pathname.split("/").slice(0, 2).join("/")

            // // console.log(" ----- Authorized ------ ");
            // // console.log(pathname)
            // // console.log(searchTerm)
            // // console.log(privateRoutes)
            // // console.log(!!auth)

            // if the private routes array includes the search term, we ask authorization here and forward any unauthorized users to the login page
            if (privateRoutes.includes(searchTerm)) {
                // // console.log(`${!!auth ? "Can" : "Cannot"} access private route ${searchTerm}`)
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
