import { createServer } from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const FAMILY_ACCESS_KEY = process.env.FAMILY_ACCESS_KEY;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 30);
const rateLimits = new Map();

const systemPrompt = `You are ArminGPT, a warm and useful Persian-speaking family assistant made by Farzanegan Armin Pajouh Engineering Company.
Reply in Persian by default, unless the user asks for another language.
Be concise, friendly, accurate, and appropriate for all family members.
Never claim you performed actions you cannot perform.
Do not request passwords, card details, or highly sensitive personal information.`;

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Access-Control-Allow-Headers': 'Content-Type, X-Family-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_000) throw new Error('PAYLOAD_TOO_LARGE');
  }
  return JSON.parse(body || '{}');
}

function isRateLimited(ip) {
  const now = Date.now();
  const current = rateLimits.get(ip);
  if (!current || now - current.startedAt > WINDOW_MS) {
    rateLimits.set(ip, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .slice(-12)
    .filter((message) => ['assistant', 'user'].includes(message?.role))
    .map((message) => ({
      content: String(message.content || '').slice(0, 2_000),
      role: message.role,
    }))
    .filter((message) => message.content.trim());
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  if (request.method === 'GET' && request.url === '/health') {
    return sendJson(response, 200, {
      groqConfigured: Boolean(GROQ_API_KEY),
      familyAccessConfigured: Boolean(FAMILY_ACCESS_KEY),
      ok: true,
    });
  }
  if (request.method !== 'POST' || request.url !== '/chat') {
    return sendJson(response, 404, { error: 'Not found' });
  }

  if (!FAMILY_ACCESS_KEY) {
    return sendJson(response, 503, { error: 'FAMILY_ACCESS_KEY is not configured.' });
  }

  if (request.headers['x-family-key'] !== FAMILY_ACCESS_KEY) {
    return sendJson(response, 401, { error: 'Unauthorized' });
  }

  const ip = request.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return sendJson(response, 429, { error: 'Too many requests. Try again later.' });
  }

  if (!GROQ_API_KEY) {
    return sendJson(response, 503, { error: 'GROQ_API_KEY is not configured.' });
  }

  try {
    const payload = await readJson(request);
    const messages = sanitizeMessages(payload.messages);
    if (!messages.length) return sendJson(response, 400, { error: 'A message is required.' });

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      body: JSON.stringify({
        max_completion_tokens: 600,
        messages: [{ content: systemPrompt, role: 'system' }, ...messages],
        model: GROQ_MODEL,
        temperature: 0.65,
      }),
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error(`Groq error ${groqResponse.status}: ${errorText.slice(0, 300)}`);
      return sendJson(response, 502, { error: 'AI provider is unavailable.' });
    }

    const data = await groqResponse.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return sendJson(response, 502, { error: 'AI returned an empty response.' });

    return sendJson(response, 200, { text });
  } catch (error) {
    const status = error?.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
    return sendJson(response, status, { error: 'Invalid request.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ArminGPT backend is running on http://0.0.0.0:${PORT}`);
  if (!GROQ_API_KEY) console.warn('GROQ_API_KEY is missing; online chat is disabled.');
  if (!FAMILY_ACCESS_KEY) console.warn('FAMILY_ACCESS_KEY is missing; online chat is disabled.');
});
