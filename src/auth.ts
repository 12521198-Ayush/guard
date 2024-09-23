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
        // // console.log("#####################################")
        // // console.log("Refresh response")
        // // console.log(success)
        // // console.log(status)
        // // console.log(data)
        // // console.log("#####################################")
        if (!success) {
            // // console.log("The token could not be refreshed!")
            throw data
        }

        if (status === 422 || status === 401) {
            throw new Error("The token could not be refreshed", status);
        }

        if (data.error) {
            // // console.log("The token could not be refreshed!")
            throw new Error(data.error);
        }

        // // console.log("The token has been refreshed successfully.")
        // get some data from the new access token such as exp (expiration time)
        // // console.log("Decoding token 2nd ... ")
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
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: {label: "password", type: "password"},
                mobile: { label: "Mobile", type: "text" },
                otp: { label: "otp", type: "text" }
            },


            async authorize(credentials, req): Promise<any> {
                const otp_json = {
                    mobile: credentials.mobile,
                    otp: credentials.otp
                }

                const json = {
                    username: credentials.username,
                    password: credentials.password,
                }
                const username = credentials.username as string;
                const password = credentials.password as string;
                const mobile = credentials.mobile as string;
                const otp = credentials.otp as string;

                // console.log("`````````````````````````````````````````````")
                // console.log(otp_json);
                // console.log(json);
                // console.log("`````````````````````````````````````````````")


                let hashedUsername:any;
                let hashedPassword:any;
                let hashedMobile:any;
                let hashedOtp:any;
                if(username!=undefined){
                    hashedUsername = createHash('md5').update(username).digest('hex');
                    hashedPassword = createHash('md5').update(password).digest('hex');
                }else{
                    hashedMobile = createHash('md5').update(mobile).digest('hex');
                    hashedOtp = createHash('md5').update(otp).digest('hex');
                }
                
                const payload = {
                    username: hashedUsername,
                    password: hashedPassword,
                };
                const otp_payload = {
                    mobile_hash: hashedMobile,
                    otp_hash: hashedOtp
                }

               // console.log("**********************")
                //console.log(otp_payload);
               // console.log("**********************")

                const isOtpLogin = mobile && otp;

                const apiEndpoint = isOtpLogin
                    ? `${process.env.API_BASE_URL}/user-service/admin/login/otp_verify`
                    : `${process.env.API_BASE_URL}/user-service/admin/login/password`;

                const body = isOtpLogin ? JSON.stringify(otp_payload) : JSON.stringify(payload);

                const res = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: body,
                });


                // external api for users to log in, change it with your own endpoint
                // const res = await fetch(`${process.env.API_BASE_URL}/user-service/admin/login/password`, {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify(payload)
                // })

                // // console.log("++++++++++++++++++++++++++++++++++")
                //console.log("Login Response")
                // // console.log("++++++++++++++++++++++++++++++++++")
                // // console.log(res.ok)
                // // console.log(res.status)

                const userData = await res.json();

                if (!res.ok) {
                    throw new Error(userData.error.message)
                }

                // console.log(userData.data)
                // // console.log("++++++++++++++++++++++++++++++++++")

                const expiration = new Date();
                expiration.setHours(expiration.getHours() + 1);
                
                interface Premise {
                    premise_id: string;
                    premise_name: string;
                    current_premise_name:string;
                    admin_name: string;
                    admin_designation: string;
                    admin_email: string;
                  }
                  const premise = userData.data.premises_associated_with.find(
                    (premise: Premise) => premise.premise_name === userData.data.primary_premise_name
                  );
                //   console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                //   console.log(premise)
                //   console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                  
                const user = {
                    //isAdmin: true, 
                    name: userData.data.premises_associated_with[0]?.admin_name,
                    role: premise.admin_designation,  // Accessing the first element of the array
                    email: userData.data.premises_associated_with[0]?.admin_email,
                    current_premise_name:userData.data.primary_premise_name,
                    img: "/avatar.png",
                    accessToken: userData.data.accessToken,
                    refreshToken: userData.data.refreshToken,
                    exp: expiration.toISOString(),
                    primary_premise_id: userData.data.primary_premise_id,
                    primary_premise_name:userData.data.primary_premise_name,
                    premises_associated_with:userData.data.premises_associated_with,
                    sub_premise_access_control_reqd: userData.data.sub_premise_access_control_reqd,
                    subpremiseArray: userData.data.subpremiseArray
                };
                //  console.log(user);

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

                    // // console.log("Cokkies set: ", user);
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
        async jwt({ token, user, account,trigger,session  }) {
            // // console.log("Inside JWT");
            // // console.log(token)
            

            if (account && user) {
                
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
                // // console.log("Decoded token 1st ... ")
                if (decodedAccessToken) {
                    token.email = decodedAccessToken["email"] as string
                    token.userId = decodedAccessToken["sub"] as string
                    token.societyList = decodedAccessToken["society_array"] as string[]
                    token.accessTokenExpires = decodedAccessToken["exp"] * 1000
                    token.picture = decodedAccessToken["picture"] ?? '/avatar.png'
                }
            }

    
            if(trigger === 'update') {
                token.current_premise_name = session.user.current_premise_name,
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
                    current_premise_name:token.current_premise_name as any,
                    role: token.role as string,
                    primary_premise_id: token.primary_premise_id as string,
                    primary_premise_name: token.primary_premise_name as string,
                    premises_associated_with: token.premises_associated_with as string[],
                    sub_premise_access_control_reqd: token.sub_premise_access_control_reqd as string,
                    subpremiseArray: token.subpremiseArray as string[]

                },
                error: token.error,
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
                    return Response.redirect(new URL("/dashboard", request.nextUrl))
                }
                return true
            }
            return true
        },
    },
    debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { auth, handlers } = NextAuth(config);
