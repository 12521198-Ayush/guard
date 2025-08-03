import { cookies } from 'next/headers';

export async function GET() {
  const prefix = process.env.NODE_ENV === 'production' ? '__Pro-' : '';
  const refreshToken = cookies().get(`${prefix}xxx.guard-refresh`)?.value;

  if (!refreshToken) {
    return Response.json({ success: false, error: 'No refresh token found' }, { status: 401 });
  }

  return Response.json({ success: true, refreshToken });
}