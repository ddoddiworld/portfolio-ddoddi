const enc = new TextEncoder();
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), x => x.toString(16).padStart(2, '0')).join('');
}
export function equal(a, b) { let diff = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return diff === 0; }
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!/^\/api\/comments(?:\/[a-f0-9-]{36})?$/.test(url.pathname)) return json({ error: '페이지를 찾을 수 없습니다.' }, 404);
    if (!['GET', 'POST', 'DELETE'].includes(request.method)) return json({ error: '지원하지 않는 요청입니다.' }, 405);
    if (request.method !== 'GET') {
      if (request.headers.get('Origin') !== url.origin) return json({ error: '허용되지 않은 요청입니다.' }, 403);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: '잘못된 요청입니다.' }, 415);
      // Read a bounded body before forwarding; never buffer arbitrary uploads.
      const reader = request.body?.getReader(); let size = 0; const chunks = [];
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 8192) { await reader.cancel(); return json({ error: '입력 내용이 너무 깁니다.' }, 413); } chunks.push(value); } }
      const body = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
      request = new Request(request, { body });
    }
    const headers = new Headers(request.headers);
    // Never trust a client-provided rate-limit identity.
    headers.set('X-Visitor-IP', request.headers.get('CF-Connecting-IP') || 'local');
    return env.COMMENTS.get(env.COMMENTS.idFromName('guestbook')).fetch(new Request(request, { headers }));
  }
};
export class Comments {
  constructor(ctx, env) {
    this.sql = ctx.storage.sql; this.env = env;
    this.sql.exec('CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, author TEXT NOT NULL, body TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, created INTEGER NOT NULL)');
    this.sql.exec('CREATE INDEX IF NOT EXISTS comments_order ON comments(created DESC, id DESC)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS limits (visitor TEXT PRIMARY KEY, window INTEGER NOT NULL, writes INTEGER NOT NULL)');
  }
  async fetch(request) {
    try {
      const url = new URL(request.url); const id = url.pathname.split('/')[3];
      if (request.method === 'GET') {
        if (id) return json({ error: '페이지를 찾을 수 없습니다.' }, 404);
        const cursor = url.searchParams.get('before') || '';
        const rows = [...this.sql.exec('SELECT id, author, body, created FROM comments WHERE (? = \'\' OR id < ?) ORDER BY id DESC LIMIT 21', cursor, cursor)];
        return json({ comments: rows.slice(0,20), next: rows.length > 20 ? rows[19].id : null });
      }
      const now = Date.now();
      const ip = request.headers.get('X-Visitor-IP') || 'local';
      const visitor = await hashPassword(ip, this.env.RATE_SALT || 'portfolio-rate-v1');
      this.sql.exec('DELETE FROM limits WHERE window < ?', now - 600000);
      const limit = [...this.sql.exec('SELECT * FROM limits WHERE visitor = ?', visitor)][0];
      if (limit && limit.writes >= 10) return json({ error: '요청이 많습니다. 10분 후 다시 시도해 주세요.' }, 429);
      this.sql.exec('INSERT INTO limits(visitor, window, writes) VALUES (?, ?, 1) ON CONFLICT(visitor) DO UPDATE SET writes = writes + 1', visitor, now);
      let data; try { data = await request.json(); } catch { return json({ error: '잘못된 입력입니다.' }, 400); }
      if (!data || typeof data !== 'object' || typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128) return json({ error: '비밀번호는 8~128자로 입력해 주세요.' }, 400);
      if (request.method === 'POST') {
        if (id) return json({ error: '잘못된 요청입니다.' }, 405);
        if (data.website) return json({ error: '등록할 수 없습니다.' }, 400);
        const author = typeof data.author === 'string' ? data.author.trim() : '';
        const body = typeof data.body === 'string' ? data.body.trim() : '';
        if (!author || author.length > 30 || !body || body.length > 1000) return json({ error: '이름은 30자, 댓글은 1,000자 이내로 입력해 주세요.' }, 400);
        const salt = crypto.randomUUID(); const hash = await hashPassword(data.password, salt);
        const commentId = now.toString(16).padStart(12, '0') + '-' + crypto.randomUUID().replaceAll('-', '').slice(0, 23);
        this.sql.exec('INSERT INTO comments VALUES (?, ?, ?, ?, ?, ?)', commentId, author, body, salt, hash, now);
        return json({ id: commentId }, 201);
      }
      if (!id) return json({ error: '댓글을 선택해 주세요.' }, 400);
      const row = [...this.sql.exec('SELECT salt, hash FROM comments WHERE id = ?', id)][0];
      if (!row) return json({ error: '이미 삭제된 댓글입니다.' }, 404);
      let allowed = false;
      if (data.admin === true) {
        if (!this.env.ADMIN_PASSWORD) return json({ error: '관리자 비밀번호가 아직 설정되지 않았습니다.' }, 503);
        allowed = equal(await hashPassword(data.password, 'admin'), await hashPassword(this.env.ADMIN_PASSWORD, 'admin'));
      } else allowed = equal(await hashPassword(data.password, row.salt), row.hash);
      if (!allowed) return json({ error: '비밀번호가 일치하지 않습니다.' }, 403);
      this.sql.exec('DELETE FROM comments WHERE id = ?', id);
      return json({ deleted: true });
    } catch { return json({ error: '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, 500); }
  }
}
