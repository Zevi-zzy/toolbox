import { NextResponse } from 'next/server';

const toolDefinitions: Record<string, any> = {
  'excel-helper': {
    name: 'AI Excel Helper',
    description: 'Converts natural language descriptions into Excel formulas or VBA macros.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The description of the excel task' }
      },
      required: ['prompt']
    }
  },
  'optimize-prompt': {
    name: 'AI Prompt Optimizer',
    description: 'Optimizes simple prompts into high-quality, structured AI instructions.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The prompt to optimize' }
      },
      required: ['prompt']
    }
  },
  'generate-mindmap': {
    name: 'AI Mindmap Generator',
    description: 'Generates Mermaid mindmap syntax from text content.',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The text content to visualize' }
      },
      required: ['content']
    }
  },
  // Add more as needed
};

export async function GET(
  req: Request,
  { params }: { params: { toolId: string } }
) {
  const { toolId } = params;
  const def = toolDefinitions[toolId];

  if (!def) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  }

  const origin = new URL(req.url).origin;

  const manifest = {
    openapi: '3.1.0',
    info: {
      title: `${def.name} API`,
      description: def.description,
      version: 'v1.0.0'
    },
    servers: [{ url: origin }],
    paths: {
      [`/api/v1/tools/${toolId}`]: {
        post: {
          operationId: `call${toolId.replace(/-/g, '')}`,
          summary: def.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: def.parameters
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            }
          },
          security: [{ ApiKeyAuth: [] }]
        }
      }
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  };

  return NextResponse.json(manifest);
}
