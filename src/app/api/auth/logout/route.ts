import { cookies } from "next/headers";

let isLoggingOut = false;  // Mutex flag to prevent multiple logout requests

export async function POST(request: Request) {
  // If the logout process is already ongoing, return early
  if (isLoggingOut) {
    console.log("Logout is already in progress. Skipping the request.");
    return Response.json({
      success: false,
      status: 429, // Too many requests
      message: "Logout request is already in progress.",
    });
  }

  // Set the flag to indicate logout is in progress
  isLoggingOut = true;

  const body = await request.json();

  const prefix = process.env.NODE_ENV === "production" ? "__Pro-" : "";
  const refreshToken = cookies().get(`${prefix}xxx.refresh-token`)?.value;
  const data = { token: refreshToken };

  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
  console.log("calling logout with this access token:", body.accessToken);
  console.log("calling logout with this refresh token:", data.token);
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

  // Check if either accessToken or refreshToken is null/undefined
  if (!body.accessToken || !data.token) {
    console.log("Access token or refresh token is missing. Skipping API call.");
    isLoggingOut = false;  // Reset the flag if the process is skipped
    return Response.json({
      success: false,
      status: 400,
      message: "Missing access token or refresh token",
    });
  }

  try {
    // Proceed with the API call if both tokens are present
    const res = await fetch(`${process.env.API_BASE_URL}/user-service/user/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${body.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    // Remove cookies after logout
    cookies().getAll().map((cookie) => {
      if (cookie.name.startsWith(`${prefix}xxx.`)) {
        cookies().delete(cookie.name as any);
      }
    });

    // Return the response from the logout API
    return Response.json({
      success: res.ok,
      status: res.status,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return Response.json({
      success: false,
      status: 500,
      message: "An error occurred during logout",
    });
  } finally {
    // Reset the flag after the logout process completes
    isLoggingOut = false;
  }
}
