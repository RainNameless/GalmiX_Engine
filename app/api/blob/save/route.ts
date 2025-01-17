import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = Math.random().toString(36).substring(2, 15);
    const content = JSON.stringify({
      id,
      ...data,
      lastUpdated: new Date().toISOString()
    }, null, 2);

    const { url } = await put(`game-${id}.json`, content, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to save game data:', error);
    return NextResponse.json({ error: 'Failed to save game data' }, { status: 500 });
  }
}

