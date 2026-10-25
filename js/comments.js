(function () {
  'use strict';
  const form = document.getElementById('commentForm');
  const list = document.getElementById('commentList');
  const status = document.getElementById('commentStatus');
  const more = document.getElementById('moreComments');
  let cursor = null;
  const dialog = document.createElement('dialog');
  dialog.className = 'comment-delete';
  dialog.innerHTML = '<form method="dialog"><h3>댓글 삭제</h3><label>삭제 비밀번호<input type="password" name="password" minlength="8" maxlength="128" required autocomplete="off"></label><label><span><input type="checkbox" name="admin"> 관리자 비밀번호로 삭제</span></label><p role="status"></p><button type="button" data-cancel>취소</button> <button type="submit">삭제</button></form>';
  document.body.append(dialog);
  dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { dialog.querySelector('form').reset(); dialog.querySelector('[role="status"]').textContent = ''; });
  let selectedId;
  async function api(path, options) {
    const response = await fetch('/api/comments' + path, options);
    let data;
    try { data = await response.json(); } catch { throw new Error('댓글 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
    if (!response.ok) throw new Error(data.error || '처리하지 못했습니다.');
    return data;
  }
  async function load(append = false) {
    more.disabled = true;
    try {
      const data = await api(append && cursor ? '?before=' + encodeURIComponent(cursor) : '');
      if (!append) list.replaceChildren();
      data.comments.forEach(comment => {
        const article = document.createElement('article'); article.className = 'guest-comment';
        const header = document.createElement('header'); const author = document.createElement('strong'); author.textContent = comment.author;
        const time = document.createElement('time'); time.dateTime = new Date(comment.created).toISOString(); time.textContent = new Date(comment.created).toLocaleDateString('ko-KR');
        const button = document.createElement('button'); button.type = 'button'; button.textContent = '삭제'; button.setAttribute('aria-label', comment.author + '님의 댓글 삭제'); button.onclick = () => { selectedId = comment.id; dialog.showModal(); };
        const body = document.createElement('p'); body.textContent = comment.body;
        header.append(author, time, button); article.append(header, body); list.append(article);
      });
      cursor = data.next; more.hidden = !cursor;
    } catch (error) { status.textContent = error.message; }
    finally { more.disabled = false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      await api('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      form.reset(); status.textContent = '댓글을 남겼어요. 감사합니다.'; await load();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
  dialog.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault(); const button = dialog.querySelector('[type="submit"]'); button.disabled = true;
    try {
      await api('/' + selectedId, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: dialog.querySelector('[name="password"]').value, admin: dialog.querySelector('[name="admin"]').checked }) });
      dialog.close(); status.textContent = '댓글을 삭제했어요.'; await load();
    } catch (error) { dialog.querySelector('[role="status"]').textContent = error.message; }
    finally { button.disabled = false; }
  });
  more.onclick = () => load(true);
  load();
})();
