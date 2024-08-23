import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
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

    interface Session {
        user: User & DefaultSession["user"]
        expires: string
        error: string
    }
}
