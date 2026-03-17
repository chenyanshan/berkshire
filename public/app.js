const listEl = document.getElementById('doc-list');
const viewerEl = document.getElementById('viewer');
const searchEl = document.getElementById('search');

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      continue;
    }

    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineFormat(li[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  return html.join('\n');
}

function inlineFormat(text) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return output;
}

let docs = [];
let activeId = '';

function renderList(filter = '') {
  const keyword = filter.trim().toLowerCase();
  const filtered = docs.filter((doc) => doc.title.toLowerCase().includes(keyword));

  listEl.innerHTML = filtered
    .map(
      (doc) =>
        `<li><button data-id="${doc.id}" class="${doc.id === activeId ? 'active' : ''}">${escapeHtml(
          doc.title,
        )}</button></li>`,
    )
    .join('');
}

async function openDoc(id) {
  const response = await fetch(`/documents_zh_md/${id}`);
  if (!response.ok) {
    viewerEl.innerHTML = `<p>文档加载失败：${id}</p>`;
    return;
  }

  const text = await response.text();
  viewerEl.innerHTML = markdownToHtml(text);
  activeId = id;
  renderList(searchEl.value);
}

listEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) {
    return;
  }
  openDoc(button.dataset.id);
});

searchEl.addEventListener('input', () => {
  renderList(searchEl.value);
});

const manifestResp = await fetch('/manifest.json');
docs = await manifestResp.json();
renderList();

if (docs.length > 0) {
  openDoc(docs[0].id);
}
