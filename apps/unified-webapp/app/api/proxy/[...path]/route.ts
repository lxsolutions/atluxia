import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

const SERVICE_URLS = {
  nomad: process.env.NOMAD_API_URL || 'http://localhost:3000',
  polyverse: process.env.POLYVERSE_API_URL || 'http://localhost:3001',
  everpath: process.env.EVERPATH_API_URL || 'http://localhost:3003',
  critters: process.env.CRITTERS_API_URL || 'http://localhost:56456',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const [service, ...restPath] = resolvedParams.path;
  const serviceUrl = SERVICE_URLS[service as keyof typeof SERVICE_URLS];

  if (!serviceUrl) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const targetUrl = `${serviceUrl}/api/${restPath.join('/')}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': session.user.id,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error for ${service}:`, error);
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const [service, ...restPath] = resolvedParams.path;
  const serviceUrl = SERVICE_URLS[service as keyof typeof SERVICE_URLS];

  if (!serviceUrl) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const targetUrl = `${serviceUrl}/api/${restPath.join('/')}`;
  const body = await request.json();

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': session.user.id,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error for ${service}:`, error);
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}