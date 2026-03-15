import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-keys';
import { checkUsage, incrementUsage } from '@/lib/usage';
import { toolServices } from '@/services/ai';

export async function POST(
  req: Request,
  { params }: { params: { toolId: string } }
) {
  try {
    const { toolId } = params;
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    // 1. Validate API Key
    const auth = await validateApiKey(apiKey);
    if (!auth) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 });
    }

    // 2. Check Usage
    const { allowed } = await checkUsage(auth.userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Usage limit exceeded' }, { status: 403 });
    }

    // 3. Get Payload
    const body = await req.json();
    const { content, prompt, type } = body;

    // 4. Call Service
    const service = (toolServices as any)[toolId];
    if (!service) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Standardize input based on tool
    let result;
    if (toolId === 'excel-helper' || toolId === 'optimize-prompt') {
      result = await service(prompt || content);
    } else if (toolId === 'report-gen') {
      result = await service(content, type);
    } else {
      result = await service(content);
    }

    // 5. Increment Usage
    await incrementUsage(auth.userId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`API V1 Error (${params.toolId}):`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
