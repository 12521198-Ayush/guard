import NextAuth from "next-auth";

declare module "next-auth" {
  
  interface Session {
    user: {
        premise_unit_id: any;
        registration_status: string;
        id: string;
        email: string;
        name: String;
        phone: string;
        img: string;
        data: object;
        skill: string;
        primary_premise_id: string;
        security_guard_fcmid: string;
        security_guard_id: string;
        admin_email: string;
        primary_premise_name: string;
        premises_associated_with: string[];
        accessToken: string;
        current_premise_name: any;
        refreshToken: string;
        accessTokenExpires: number;
        role: string;
        isAdmin: boolean;
        sub_premise_id: string;
        username: string;
        sub_premise_access_control_reqd: string;
        subpremiseArray: string[];

    };
  }
}
