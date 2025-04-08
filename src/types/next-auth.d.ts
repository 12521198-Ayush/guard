import { DefaultSession } from "next-auth"

declare module "next-auth" {
   
    export interface User {
        id: string;
        email: string;
        name: String;
        img: string;
        data: object;
        phone: string;
        admin_email: string;
        primary_premise_id: string;
        registration_status:string;
        registration_reference: string;
        sub_premise_id: any;
        primary_premise_name: string;
        premise_unit_id: string;
        premises_associated_with: string[]
        accessToken: string
        current_premise_name: any;
        refreshToken: string
        accessTokenExpires: number
        role: string
        isAdmin: boolean
        subpremise_name: string
        username: string
        sub_premise_access_control_reqd: string
        subpremiseArray: string[]

    }

    export interface Session {
        user: User & DefaultSession["user"]
        expires: string
        error: string
    }
}
