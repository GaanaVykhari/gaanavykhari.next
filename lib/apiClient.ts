export type ProxyInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export async function proxyRequest(
  path: string,
  init: ProxyInit = {}
): Promise<any | Response> {
  const { method = 'GET', headers = {}, body } = init;
  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing BACKEND_BASE_URL env var');
  }

  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, requestInit);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    const message =
      typeof data === 'object' && data && (data as any).message
        ? (data as any).message
        : res.statusText;
    return new Response(
      JSON.stringify({ ok: false, message: message || 'Request failed' }),
      { status: res.status, headers: { 'content-type': 'application/json' } }
    );
  }
  return data as unknown;
}
