import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define a type for the expected request body for creating a memo
interface CreateMemoRequestBody {
  content: string;
  visibility?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  resourceIdList?: number[];
  // Add any other fields that the Memos API might expect
  [key: string]: any;
}

// Environment variable for the Memos API endpoint
// This should be configured in your Next.js environment (e.g., .env.local)
// For now, we'll assume a single Memos instance for the authenticated user.
// A more complex setup might involve dynamic resolution based on the user.
const MEMOS_API_URL = process.env.MEMOS_API_URL; // e.g., https://your-memos-instance.com

export async function POST(request: NextRequest) {
  if (!MEMOS_API_URL) {
    return NextResponse.json({ error: 'Memos API URL is not configured.' }, { status: 500 });
  }

  const token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'Authorization token is missing.' }, { status: 401 });
  }

  try {
    const body: CreateMemoRequestBody = await request.json();

    const { content, visibility = 'PUBLIC', resourceIdList = [], ...otherFields } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    const memosApiResponse = await fetch(`${MEMOS_API_URL.replace(/\/$/, '')}/api/v1/memo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        content,
        visibility,
        resourceIdList,
        ...otherFields, // Include any other passthrough fields
      }),
    });

    const responseData = await memosApiResponse.json();

    if (!memosApiResponse.ok) {
      return NextResponse.json({ error: 'Failed to create memo in Memos API.', details: responseData }, { status: memosApiResponse.status });
    }

    return NextResponse.json(responseData, { status: memosApiResponse.status });
  } catch (error: any) {
    console.error('Error creating memo:', error);
    if (error instanceof SyntaxError) { // Handle cases where request.json() fails
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

// Fallback for other methods if needed, e.g., GET, PUT, DELETE on this route
export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
