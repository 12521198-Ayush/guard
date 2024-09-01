import NextAuth from "next-auth"
import { cookies, headers } from "next/headers"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PRIVATE_ROUTES as privateRoutes } from "@/constants/ROUTES"
// @ts-ignore

async function refreshAccessToken(token) { 
    // this is our refresh token method
    console.log("Now refreshing the expired token...")
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

        if (data.error){ 
            console.log("The token could not be refreshed!")
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
            error: "",
        }
    } catch (error) {
        console.log(error)
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
                email: {
                    label: "email",
                    type: "email",
                    placeholder: "jsmith@example.com",
                },
                password: {
                    label: "password",
                    type: "password",
                },
            },
            async authorize(credentials, req):Promise<any> {
                
                const payload = {
                    email: credentials.email,
                    password: credentials.password,
                }

                console.log("**********************")
                console.log(payload);
                console.log("**********************")
                // external api for users to log in, change it with your own endpoint
                const res = await fetch(`${process.env.API_BASE_URL}/user-service/user/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload)
                })

                console.log("++++++++++++++++++++++++++++++++++")
                console.log("Login Response")
                console.log("++++++++++++++++++++++++++++++++++")
                console.log(res.ok)
                console.log(res.status)

                const userData = await res.json();

                if (!res.ok) {
                    throw new Error(userData.error.message)
                }

                console.log(userData)
                console.log("++++++++++++++++++++++++++++++++++")

                const expiration = new Date();
                expiration.setHours(expiration.getHours() + 1);                    
                const user = {
                    isAdmin: true, 
                    username: credentials.email,
                    email: credentials.email,
                    name:"Gaurav Bansaaal", 
                    img:"/avatar.png",
                    accessToken: userData.data.accessToken,
                    refreshToken: userData.data.refreshToken,
                    exp: expiration.toISOString()
                };
                console.log(user);

                if (res.ok && user) {
                    const prefix = process.env.NODE_ENV === "development" ? "__Dev-" : ""

                    // we set http only cookie here to store refresh token information as we will not append it 
                    // to our session to avoid maximum size warning for the session cookie (4096 bytes)
                    cookies().set({
                        name: `${prefix}xxx.refresh-token`,
                        value: user.refreshToken,
                        httpOnly: true,
                        sameSite: "strict",
                        secure: true,
                    } as any)

                    console.log("Cokkies set: ", user);
                    return user
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
        async jwt({ token, user, account }) {            
            console.log("Inside JWT");
            console.log(token)
            console.log(user)
            console.log(account)
            
            if (account && user) {
                token.id = user.id
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.role = "Unknown" // the user role
                console.log("Decoding token 1st ... ")
                const decodedAccessToken = JSON.parse(Buffer.from(user.accessToken.split(".")[1], "base64").toString())
                console.log("Decoded token 1st ... ")
                if (decodedAccessToken) {
                    token.role = decodedAccessToken["role"] as string
                    token.email = decodedAccessToken["email"] as string
                    token.userId = decodedAccessToken["sub"] as string
                    token.societyList = decodedAccessToken["society_array"] as string[]
                    token.accessTokenExpires = decodedAccessToken["exp"] * 1000 
                    token.picture = decodedAccessToken["picture"] ?? '/avatar.png'
                }
            }

            // if our access token has not expired yet, return all information except the refresh token
            if (token.accessTokenExpires && (Date.now() < Number(token.accessTokenExpires))) {
                const { refreshToken, ...rest } = token
                console.log(" *** Access token valid *** ");
                return rest
            }

            //if our access token has expired, refresh it and return the result
            console.log("Token expired calling refresh token...");
            return await refreshAccessToken(token)
        },

        async session({ session, token }) {
            console.log("session => ", session)
            
            const mySession = {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    societyList: token.societyList as string[],
                    accessToken: token.accessToken as string,
                    accessTokenExpires: token.accessTokenExpires as number,
                    role: token.role as string
                },
                error: token.error,
            }
            console.log("session => ", mySession);
            return mySession;
        },
        authorized({ request, auth }) {
            
            const { pathname } = request.nextUrl
            // get the route name from the url such as "/about"
            const searchTerm = request.nextUrl.pathname.split("/").slice(0, 2).join("/")

            console.log(" ----- Authorized ------ ");
            console.log(pathname)
            console.log(searchTerm)
            console.log(privateRoutes)
            console.log(!!auth)

            // if the private routes array includes the search term, we ask authorization here and forward any unauthorized users to the login page
            if (privateRoutes.includes(searchTerm)) {
                console.log(`${!!auth ? "Can" : "Cannot"} access private route ${searchTerm}`)
                return !!auth
            // if the pathname starts with one of the routes below and the user is already logged in, forward the user to the home page
            } else if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/signup")) {
                const isLoggedIn = !!auth
                if (isLoggedIn) {
                    return Response.redirect(new URL("/", request.nextUrl))
                }
                return true
            }
            return true
        },
    },
    debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { auth, handlers } = NextAuth(config);
