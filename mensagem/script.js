(() => {
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfj3XY8BBF0YBx8NnzumyBHEKY7ijzlZ9c6_0n7dqO5zYk6BA/formResponse';
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ORtLESNcI3935ScDdpQIintn79YatMgZv05FZp3QmDQ/gviz/tq?gid=0&tqx=out:json&range=B2:C&headers=0';

  const form = document.querySelector('#message-form');
  if (form) {
    const name = form.elements.name;
    const message = form.elements.message;
    const status = document.querySelector('#status');
    const counter = document.querySelector('#counter');
    const submit = form.querySelector('button[type="submit"]');
    message.addEventListener('input', () => { counter.textContent = `${message.value.length} / 240`; });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const content = message.value.trim();
      if (!content) { message.focus(); return; }
      submit.disabled = true;
      status.className = 'status';
      status.textContent = 'Enviando…';
      const data = new URLSearchParams();
      data.set('entry.587894216', name.value.trim());
      data.set('entry.810367381', content);
      try {
        await fetch(FORM_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: data.toString() });
        status.textContent = 'Mensagem enviada. Obrigado por participar!';
        form.reset();
        counter.textContent = '0 / 240';
      } catch (error) {
        status.className = 'status error';
        status.textContent = 'Não foi possível enviar. Confira sua conexão e tente novamente.';
      } finally { submit.disabled = false; }
    });
  }

  const cloud = document.querySelector('#cloud');
  if (!cloud) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const colors = ['#74b8dc', '#c9a3df', '#e7bd65', '#73c5ac', '#dc968b'];
  const dialog = document.querySelector('#message-dialog');
  const refresh = document.querySelector('#refresh');
  let messages = [];
  let loading = false;
  let lastSize = '';

  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  function svgElement(tag, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  // Each shared edge is drawn once. Its neighbor uses the same curves in reverse.
  function edge(x, y, dx, dy, direction, depth) {
    const length = Math.hypot(dx, dy);
    const point = (t, offset) => [
      x + dx * t - dy / length * offset * depth * direction,
      y + dy * t + dx / length * offset * depth * direction
    ];
    if (!direction) return [[point(0, 0), point(0, 0), point(1, 0), point(1, 0)]];
    return [
      [[0, 0], [.15, 0], [.34, 0], [.42, 0]],
      [[.42, 0], [.48, 0], [.43, -.25], [.40, -.48]],
      [[.40, -.48], [.30, -1.30], [.70, -1.30], [.60, -.48]],
      [[.60, -.48], [.57, -.25], [.52, 0], [.58, 0]],
      [[.58, 0], [.66, 0], [.85, 0], [1, 0]]
    ].map(curve => curve.map(([t, offset]) => point(t, offset)));
  }

  function reverseEdge(curves) {
    return curves.slice().reverse().map(curve => curve.slice().reverse());
  }

  function piecePath(edges) {
    const curves = edges.flat();
    return `M ${curves[0][0].join(' ')} ` + curves.map(curve =>
      `C ${curve.slice(1).map(point => point.join(' ')).join(' ')}`
    ).join(' ') + ' Z';
  }

  function openMessage(item) {
    document.querySelector('#dialog-message').textContent = item.message;
    document.querySelector('#dialog-name').textContent = `- ${item.name}`;
    dialog.showModal();
  }

  function renderPuzzle() {
    if (!messages.length) return;
    const width = cloud.clientWidth;
    const height = cloud.clientHeight;
    if (!width || !height) return;
    const columns = Math.max(1, Math.floor(width / 240));
    const rows = Math.max(1, Math.floor(height / 180));
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const depth = Math.min(cellWidth, cellHeight) * .18;
    const visible = messages.slice(-columns * rows);
    const horizontal = Array.from({ length: rows + 1 }, (_, row) =>
      Array.from({ length: columns }, (_, col) => edge(
        col * cellWidth, row * cellHeight, cellWidth, 0,
        row === 0 || row === rows ? 0 : ((row + col) % 2 ? 1 : -1), depth
      )));
    const vertical = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns + 1 }, (_, col) => edge(
        col * cellWidth, row * cellHeight, 0, cellHeight,
        col === 0 || col === columns ? 0 : ((row + col) % 2 ? -1 : 1), depth
      )));
    const svg = svgElement('svg', {
      viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none',
      class: 'puzzle', 'aria-label': 'Quebra-cabeça de mensagens'
    });
    visible.forEach((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const group = svgElement('g', {
        class: 'puzzle-piece', role: 'button', tabindex: '0',
        'aria-label': `${item.message} - ${item.name}`, 'aria-haspopup': 'dialog'
      });
      group.append(svgElement('path', {
        d: piecePath([
          horizontal[row][col], vertical[row][col + 1],
          reverseEdge(horizontal[row + 1][col]), reverseEdge(vertical[row][col])
        ]), fill: colors[(row * 2 + col) % colors.length]
      }));
      // Text stays inside the solid center, away from the tabs and sockets.
      const insetX = Math.max(depth + 8, cellWidth * .12);
      const insetY = depth + 6;
      const foreign = svgElement('foreignObject', {
        x: col * cellWidth + insetX, y: row * cellHeight + insetY,
        width: cellWidth - 2 * insetX, height: cellHeight - 2 * insetY
      });
      const text = document.createElement('div');
      text.className = 'piece-text';
      text.style.fontSize = `${12 + 3 * index / Math.max(visible.length - 1, 1)}px`;
      const content = document.createElement('span');
      content.className = 'piece-message';
      content.textContent = item.message;
      const name = document.createElement('small');
      name.textContent = `- ${item.name}`;
      text.append(content, name);
      foreign.append(text);
      group.append(foreign);
      group.addEventListener('click', () => openMessage(item));
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openMessage(item);
        }
      });
      svg.append(group);
    });
    cloud.replaceChildren(svg);
    // Fit the preview to its piece; the dialog always contains the full message.
    cloud.querySelectorAll('.piece-text').forEach(text => {
      let size = parseFloat(text.style.fontSize);
      while (text.scrollHeight > text.clientHeight && size > 10) {
        size -= .5;
        text.style.fontSize = `${size}px`;
      }
    });
  }

  async function loadMessages() {
    if (loading) return;
    loading = true;
    refresh.disabled = true;
    try {
      const response = await fetch(SHEET_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Falha ao consultar a planilha');
      const raw = await response.text();
      const data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
      if (data.status === 'error' || !data.table) throw new Error('Resposta inválida');
      messages = (data.table.rows || []).flatMap(row => {
        const name = row.c?.[0]?.v;
        const message = row.c?.[1]?.v;
        return typeof message === 'string' && message.trim()
          ? [{ name: typeof name === 'string' && name.trim() ? name.trim() : 'Visitante', message: message.trim() }]
          : [];
      });
      if (messages.length) renderPuzzle();
      else cloud.replaceChildren();
      refresh.title = 'Atualizar mural';
    } catch (error) {
      refresh.title = 'Falha ao carregar. Clique para tentar novamente.';
      if (!messages.length) cloud.textContent = 'Não foi possível carregar as mensagens.';
    } finally {
      loading = false;
      refresh.disabled = false;
    }
  }

  new ResizeObserver(() => {
    const size = `${cloud.clientWidth}:${cloud.clientHeight}`;
    if (size !== lastSize) {
      lastSize = size;
      renderPuzzle();
    }
  }).observe(cloud);
  refresh.addEventListener('click', loadMessages);
  loadMessages();
  window.setInterval(loadMessages, 60000);
})();
