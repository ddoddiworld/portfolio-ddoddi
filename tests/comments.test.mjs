import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { Comments } from '../server/worker.js';
function setup() {
  const db = new DatabaseSync(':memory:');
  const sql = { exec(query, ...params) { const statement = db.prepare(query); return statement.columns().length ? statement.all(...params) : (statement.run(...params), []); } };
  const comments = new Comments({ storage: { sql } }, { ADMIN_PASSWORD: 'admin07' });
  return { db, comments };
}
function req(method, path = '', data, ip = 'tester') { return new Request('https://portfolio.test/api/comments' + path, { method, headers: { 'Content-Type':'application/json', Origin:'https://portfolio.test', 'X-Visitor-IP':ip }, ...(data ? {body:JSON.stringify(data)} : {}) }); }
const content = { author:'테스터', body:'<script>alert(1)</script>', password:'visitor-test-only' };
test('create, list without secrets, wrong password rejected, owner deletion', async () => {
  const { comments } = setup();
  const response = await comments.fetch(req('POST','',content)); assert.equal(response.status,201);
  const {id} = await response.json(); const listed = await (await comments.fetch(req('GET'))).json();
  assert.equal(listed.comments[0].body,content.body); assert.deepEqual(Object.keys(listed.comments[0]).sort(),['author','body','created','id']);
  assert.equal((await comments.fetch(req('DELETE','/'+id,{password:'incorrect'}))).status,403);
  assert.equal((await comments.fetch(req('DELETE','/'+id,{password:content.password}))).status,200);
  assert.equal((await (await comments.fetch(req('GET'))).json()).comments.length,0);
});
test('admin can delete another author but wrong admin password cannot',async()=>{
  const {comments}=setup(); const {id}=await (await comments.fetch(req('POST','',content))).json();
  assert.equal((await comments.fetch(req('DELETE','/'+id,{password:'wrong-admin',admin:true}))).status,403);
  assert.equal((await comments.fetch(req('DELETE','/'+id,{password:'admin07',admin:true}))).status,200);
});
test('validation and rate limit reject abusive requests',async()=>{
  const {comments}=setup();
  assert.equal((await comments.fetch(req('POST','',{...content,body:' '}))).status,400);
  assert.equal((await comments.fetch(req('POST','',{...content,password:'short'}))).status,400);
  assert.equal((await comments.fetch(req('POST','',{...content,website:'spam'}))).status,400);
  for(let i=0;i<7;i++) await comments.fetch(req('POST','',content));
  assert.equal((await comments.fetch(req('POST','',content))).status,429);
});
test('pagination returns newest comments exactly once',async()=>{
  const {comments}=setup();
  for(let i=0;i<23;i++) assert.equal((await comments.fetch(req('POST','',{...content,body:String(i)},'ip'+i))).status,201);
  const first=await (await comments.fetch(req('GET'))).json();
  const second=await (await comments.fetch(req('GET','?before='+first.next))).json();
  assert.equal(first.comments.length,20);assert.equal(second.comments.length,3);
  assert.equal(new Set([...first.comments,...second.comments].map(x=>x.id)).size,23);
  assert.equal(first.comments[0].body,'22');assert.equal(second.next,null);
});
test('edge rejects cross-origin writes and oversized bodies',async()=>{
  const request=req('POST','',content);request.headers.set('Origin','https://evil.test');
  assert.equal((await worker.fetch(request,{})).status,403);
  assert.equal((await worker.fetch(req('POST','',{...content,body:'a'.repeat(9000)}),{})).status,413);
});
