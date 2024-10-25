import { cookies } from "next/headers"

export async function POST(request: Request) {
    const body = await request.json()

    console.log(body);

    const prefix = process.env.NODE_ENV === "development" ? "__Dev-" : ""
    const refreshToken = cookies().get(`${prefix}xxx.refresh-token`)?.value
    const data = {token: refreshToken};
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    console.log(data);
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")

    const res = await fetch(
        `${process.env.API_BASE_URL}/user-service/user/logout`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${body.accessToken}`
            },
            body: JSON.stringify(data),
        }
    );
    
    // remove cookies after
    cookies().getAll().map(cookie => {
        if (cookie.name.startsWith(`${prefix}xxx.`))
            cookies().delete(cookie.name as any)
    })

    return Response.json({
        success: res.ok,
        status: res.status,
    })
}
