import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiUrl = 'http://139.84.166.124:8060/user-service/admin/premise_unit/list';

  try {
    const body = await request.json();

    const accessToken = request.headers.get('authorization'); 

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is missing' }, { status: 401 });
    }

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken, 
      },
      body: JSON.stringify(body),
    });
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json({ error: data.message || 'Failed to fetch data' }, { status: apiResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
