import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define a type for the expected request body for updating a memo
interface UpdateMemoRequestBody {
  content?: string;
  visibility?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  resourceIdList?: number[];
  rowStatus?: 'NORMAL' | 'ARCHIVED';
  // Add any other fields that the Memos API might allow for update
  [key: string]: any;
}

// Environment variable for the Memos API endpoint
const MEMOS_API_URL = process.env.MEMOS_API_URL; // e.g., https://your-memos-instance.com

export async function PATCH(request: NextRequest, { params }: { params: { memoId: string } }) {
  if (!MEMOS_API_URL) {
    return NextResponse.json({ error: 'Memos API URL is not configured.' }, { status: 500 });
  }

  const token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'Authorization token is missing.' }, { status: 401 });
  }

  const { memoId } = params;
  if (!memoId) {
    return NextResponse.json({ error: 'Memo ID is missing.' }, { status: 400 });
  }

  try {
    const body: UpdateMemoRequestBody = await request.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Request body is empty. Nothing to update.' }, { status: 400 });
    }

    const memosApiResponse = await fetch(`${MEMOS_API_URL.replace(/\/$/, '')}/api/v1/memo/${memoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    });

    const responseData = await memosApiResponse.json();

    if (!memosApiResponse.ok) {
      return NextResponse.json({ error: `Failed to update memo ${memoId} in Memos API.`, details: responseData }, { status: memosApiResponse.status });
    }

    return NextResponse.json(responseData, { status: memosApiResponse.status });
  } catch (error: any) {
    console.error(`Error updating memo ${memoId}:`, error);
    if (error instanceof SyntaxError) { // Handle cases where request.json() fails
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { memoId: string } }) {
  if (!MEMOS_API_URL) {
    return NextResponse.json({ error: 'Memos API URL is not configured.' }, { status: 500 });
  }

  const token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'Authorization token is missing.' }, { status: 401 });
  }

  const { memoId } = params;
  if (!memoId) {
    return NextResponse.json({ error: 'Memo ID is missing.' }, { status: 400 });
  }

  try {
    const memosApiResponse = await fetch(`${MEMOS_API_URL.replace(/\/$/, '')}/api/v1/memo/${memoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    });

    // DELETE typically returns 204 No Content on success, or a JSON error object
    if (memosApiResponse.status === 204 || memosApiResponse.ok) {
        // Check if there's content before trying to parse JSON
        const textResponse = await memosApiResponse.text();
        if (textResponse) {
            try {
                const responseData = JSON.parse(textResponse);
                return NextResponse.json(responseData, { status: memosApiResponse.status });
            } catch (e) {
                // If parsing fails but status is ok, return the text (or an empty success response)
                return new NextResponse(null, { status: memosApiResponse.status });
            }
        }
      return new NextResponse(null, { status: memosApiResponse.status }); // Successfully deleted
    }

    const responseData = await memosApiResponse.json();
    return NextResponse.json({ error: `Failed to delete memo ${memoId} in Memos API.`, details: responseData }, { status: memosApiResponse.status });

  } catch (error: any) {
    console.error(`Error deleting memo ${memoId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

// Fallback for other methods if needed
export async function GET(request: NextRequest, { params }: { params: { memoId: string } }) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function POST(request: NextRequest, { params }: { params: { memoId: string } }) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest, { params }: { params: { memoId: string } }) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
