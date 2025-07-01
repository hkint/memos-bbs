import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get('url');

  if (!feedUrl) {
    return NextResponse.json({ error: 'Feed URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'MemoBBSFeedProxy/1.0', // Some servers might require a user-agent
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch feed: ${response.statusText}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');

    if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml') || contentType.includes('application/rss+xml') || contentType.includes('application/atom+xml'))) {
      const text = await response.text();
      return new NextResponse(text, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    } else if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      return NextResponse.json(json);
    } else {
        // Fallback for unknown content types, try to return as text
        console.warn(`Unknown content type for feed ${feedUrl}: ${contentType}. Returning as text.`);
        const text = await response.text();
        return new NextResponse(text, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

  } catch (error: any) {
    console.error(`Error proxying feed ${feedUrl}:`, error);
    return NextResponse.json({ error: `Failed to proxy feed: ${error.message}` }, { status: 500 });
  }
}
