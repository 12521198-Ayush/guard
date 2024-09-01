import { DefaultSession } from "next-auth"

declare module "next-auth" {
   export interface User {
        id: string
        email: string
        name: String
        img: string
        societyList: string[]
        accessToken: string
        refreshToken: string
        accessTokenExpires: number
        role: string
        isAdmin: boolean
        username: string
    
    }

   export interface Session {
        user: User & DefaultSession["user"]
        expires: string
        error: string
    }
}
