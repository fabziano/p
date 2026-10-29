'use strict';

const sheetId = '1pqP1QnDfztUJviDP7-WQD_ovDVi-MXSzRM4yBTxKY9U';
const $ = selector => document.querySelector(selector);
const dialog = $('#match-dialog');
let participants = [];
let rows = [];
let history = [];
let dragging = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function personById(id) { return participants.find(person => person.id === id); }

function portrait(person) {
  const box = element('span', 'portrait', person ? person.name.slice(0, 2).toUpperCase() : '');
  if (person?.image) {
    const image = document.createElement('img');
    image.src = person.image;
    image.alt = '';
    image.draggable = false;
    image.loading = 'lazy';
    image.addEventListener('error', () => { box.textContent = person.name.slice(0, 2).toUpperCase(); });
    box.replaceChildren(image);
  }
  return box;
}

// Rows define only the drawing. No slot depends on a result in another row.
function createBoard(count) {
  rows = [];
  history = [];
  for (let size = count; size >= 1; size = Math.ceil(size / 2)) {
    rows.push(Array(size).fill(null));
    if (size === 1) break;
  }
  render();
}

function remember() { history.push(rows.map(row => [...row])); }
function undo() {
  if (!history.length) return;
  rows = history.pop();
  if (dialog.open) dialog.close();
  render();
}

function place(id, row, index) {
  if (!personById(id) || !rows[row] || index < 0 || index >= rows[row].length || rows[row][index] === id) return;
  remember();
  // Keep appearances in other phases as history; avoid duplicates in this row.
  const previousIndex = rows[row].indexOf(id);
  if (previousIndex !== -1) rows[row][previousIndex] = rows[row][index];
  rows[row][index] = id;
  render();
  if (row === rows.length - 1) showChampion();
}

function removeDragged() {
  if (!dragging || dragging.row === undefined || !rows[dragging.row]?.[dragging.index]) return;
  remember();
  rows[dragging.row][dragging.index] = null;
  render();
}

function draggable(node, id, origin = {}) {
  if (!id) return;
  node.draggable = true;
  node.addEventListener('dragstart', event => {
    dragging = { id, ...origin };
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = origin.row === undefined ? 'move' : 'copyMove';
  });
  node.addEventListener('dragend', () => { dragging = null; });
}

function dropTarget(node, action, highlight = true) {
  node.addEventListener('dragover', event => {
    event.preventDefault();
    if (highlight) node.classList.add('drop-over');
  });
  node.addEventListener('dragleave', () => node.classList.remove('drop-over'));
  node.addEventListener('drop', event => {
    event.preventDefault();
    event.stopPropagation();
    node.classList.remove('drop-over');
    action(event.dataTransfer.getData('text/plain'));
    dragging = null;
  });
}

function renderParticipants() {
  const container = $('#participants');
  container.replaceChildren();
  const assigned = new Set(rows.flat().filter(id => id !== null));
  participants.filter(person => !assigned.has(person.id)).forEach(person => {
    const card = element('div', 'person');
    card.append(portrait(person), element('span', 'person-name', person.name));
    draggable(card, person.id);
    container.append(card);
  });
}

function slot(row, index, champion = false) {
  const person = personById(rows[row][index]);
  const button = element('button', champion ? 'champion' : 'slot');
  button.type = 'button';
  button.setAttribute('aria-label', `${champion ? 'Campeão' : 'Participante'}: ${person?.name || 'vazio'}`);
  button.append(portrait(person), element('span', 'person-name', person?.name || '\u00a0'));
  draggable(button, person?.id, { row, index });
  dropTarget(button, id => place(id, row, index));
  button.addEventListener('click', () => champion ? showChampion() : showMatch(row, Math.floor(index / 2)));
  return button;
}

function render() {
  renderParticipants();
  $('#undo').disabled = history.length === 0;
  const bracket = $('#bracket');
  bracket.replaceChildren();
  if (!rows.length) return;
  bracket.style.setProperty('--slots', Math.ceil(rows[0].length / 2) * 2);
  bracket.style.setProperty('--levels', rows.length);
  bracket.append(slot(rows.length - 1, 0, true));
  for (let row = rows.length - 2; row >= 0; row--) {
    const line = element('div', `round${row === rows.length - 2 ? ' final-round' : ''}`);
    line.style.setProperty('--matches', Math.ceil(rows[row].length / 2));
    for (let index = 0; index < rows[row].length; index += 2) {
      const match = element('div', 'match');
      const fighters = element('div', 'fighters');
      fighters.append(slot(row, index));
      if (index + 1 < rows[row].length) fighters.append(slot(row, index + 1));
      match.append(fighters);
      line.append(match);
    }
    bracket.append(line);
  }
}

function showMatch(row, match) {
  dialog.classList.remove('champion-dialog');
  dialog.setAttribute('aria-label', 'Disputa');
  const content = $('#opponents');
  content.replaceChildren();
  for (let side = 0; side < 2; side++) {
    if (side === 1) content.append(element('span', 'versus', 'X'));
    const person = personById(rows[row][match * 2 + side]);
    const card = element('div', 'person');
    card.append(portrait(person), element('span', 'person-name', person?.name || ''));
    content.append(card);
  }
  if (!dialog.open) dialog.showModal();
}

function showChampion() {
  const person = personById(rows.at(-1)?.[0]);
  if (!person) return;
  dialog.classList.add('champion-dialog');
  dialog.setAttribute('aria-label', `Campeão: ${person.name}`);
  $('#opponents').replaceChildren(
    element('h2', 'champion-title', 'Campeão'),
    portrait(person),
    element('strong', 'champion-name', person.name)
  );
  if (!dialog.open) dialog.showModal();
}

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
$('#undo').addEventListener('click', undo);
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    undo();
  }
});
dropTarget($('#participants'), removeDragged, false);

async function loadParticipants() {
  $('#status').textContent = 'Carregando participantes…';
  $('#status').hidden = false;
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&tq=SELECT%20A%2C%20B`);
    if (!response.ok) throw new Error('Falha na consulta');
    const text = await response.text();
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    if (json.status === 'error' || !Array.isArray(json.table?.rows)) throw new Error('Resposta inválida');
    participants = json.table.rows.map((row, index) => ({ id: String(index), name: String(row.c?.[0]?.v || '').trim(), image: String(row.c?.[1]?.v || '').trim() })).filter(person => person.name);
    createBoard(participants.length);
    $('#status').hidden = participants.length > 0;
    $('#status').textContent = participants.length ? '' : 'Nenhum participante encontrado na planilha.';
  } catch (error) {
    $('#status').textContent = 'Não foi possível carregar a planilha. Verifique a conexão e o acesso público.';
    $('#status').hidden = false;
  }
}

loadParticipants();
