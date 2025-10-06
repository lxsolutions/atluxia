
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy the request to the immigration service
    const response = await fetch('http://localhost:3003/immigration/paths', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Immigration service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to immigration service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa paths' },
      { status: 500 }
    );
  }
}
