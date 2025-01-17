import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    const formData = new URLSearchParams();
    formData.append('text', text);
    
    const response = await fetch('https://note.ms/xiaomizi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving to note.ms:', error);
    return NextResponse.json(
      { error: '保存到在线存档失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch('https://note.ms/xiaomizi');
    const html = await response.text();
    
    // Extract the content from the HTML response
    const content = html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i)?.[1] || '';
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching from note.ms:', error);
    return NextResponse.json(
      { error: '从在线存档加载失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

