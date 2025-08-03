"use server";
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const body = await request.json()

    const prefix = process.env.NODE_ENV === "production" ? "__Pro-" : ""
    const refreshToken = cookies().get(`${prefix}xxx.guard-refresh`)?.value
    const payload = {token: refreshToken};

    const res = await fetch(
        `${process.env.API_BASE_URL}/user-service/token`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${body.accessToken}`
            },
            body: JSON.stringify(payload),
        }
    )


    const data = await res.json()

    return Response.json({
        success: res.ok,
        status: res.status,
        data,
    })
}
