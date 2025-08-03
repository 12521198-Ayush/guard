"use server";
import { cookies } from "next/headers"

export async function POST(request: Request) {
    console.log("Starting POST handler for token refresh");
    
    console.log("Parsing request body");
    const body = await request.json();
    console.log("Request body:", body);

    // const prefix = process.env.NODE_ENV === "production" ? "__Pro-" : "";
    // console.log("Environment prefix:", prefix);

    console.log("Retrieving refresh token from cookies");
    const refreshToken = body.refreshTokenCookie;
    console.log("Refresh token:", refreshToken);

    const payload = { token: refreshToken };
    console.log("Refresh Payload:", payload);
    // console.log("Access Token:", body.accessToken);

    console.log("Sending fetch request to token endpoint");
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user-service/token`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        }
    );
    console.log("Fetch response status:", res.status);

    console.log("Parsing response data");
    const data = await res.json();
    console.log("Response data:", data);

    console.log("Returning JSON response");
    return Response.json({
        success: res.ok,
        status: res.status,
        data,
    });
}