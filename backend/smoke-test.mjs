import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['backend/server.mjs'], {
  env: {
    ...process.env,
    FAMILY_ACCESS_KEY: 'test-family-key',
    PORT: '8799',
  },
  stdio: 'ignore',
});

async function request(path, options) {
  const response = await fetch(`http://127.0.0.1:8799${path}`, options);
  return { body: await response.json(), status: response.status };
}

try {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const health = await request('/health');
  const unauthorized = await request('/chat', {
    body: JSON.stringify({ messages: [{ content: 'test', role: 'user' }] }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const missingProviderKey = await request('/chat', {
    body: JSON.stringify({ messages: [{ content: 'test', role: 'user' }] }),
    headers: {
      'Content-Type': 'application/json',
      'X-Family-Key': 'test-family-key',
    },
    method: 'POST',
  });

  if (health.status !== 200 || health.body.ok !== true) throw new Error('Health check failed');
  if (unauthorized.status !== 401) throw new Error('Unauthorized request was not rejected');
  if (missingProviderKey.status !== 503) throw new Error('Missing Groq key was not reported');

  console.log('Backend smoke test passed');
} finally {
  child.kill();
}
