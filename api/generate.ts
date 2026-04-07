import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });

    const client = new Anthropic({ apiKey: key });
    const { system, userMessage, stream } = req.body;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          system,
          messages: [{ role: 'user', content: userMessage }],
          stream: true,
        });

        for await (const chunk of response) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (streamErr: any) {
        // If streaming fails mid-way, try to send an error event
        try {
          res.write(`data: ${JSON.stringify({ error: streamErr.message })}\n\n`);
          res.end();
        } catch {
          res.end();
        }
      }
    } else {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: userMessage }],
      });
      res.json(response);
    }
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
