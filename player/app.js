const doc = document;
const audio = doc.getElementById('audio-engine');
const barra = doc.getElementById('cheio');
const barraArea = doc.getElementById('barra');
const titulo = doc.getElementById('titulo');
const lista = doc.getElementById('lista');
const iconPlay = doc.getElementById('icon-play');
const iconPause = doc.getElementById('icon-pause');

let indiceAtual = 0, duracao = 0, rafId = null;

audio.onplay = () => { if (!rafId) rafId = requestAnimationFrame(loop); };
audio.onpause = () => { cancelAnimationFrame(rafId); rafId = null; };
audio.onended = () => proxima(1);
audio.onloadedmetadata = () => duracao = audio.duration;

const atualizarIcone = (reproduzindo) => {
    iconPlay.style.display = reproduzindo ? 'none' : 'block';
    iconPause.style.display = reproduzindo ? 'block' : 'none';
};

function loop() {
    if (!audio.paused && duracao) {
        barra.style.transform = `scaleX(${audio.currentTime / duracao})`;
        rafId = requestAnimationFrame(loop);
    }
}

function tocar() {
    audio.play().then(() => atualizarIcone(true)).catch(() => atualizarIcone(false));
}

function pausar() {
    audio.pause();
    atualizarIcone(false);
}

function alternar() { audio.paused ? tocar() : pausar(); }

function carregar(indice) {
    indiceAtual = indice;
    audio.src = faixas[indice].u;
    titulo.textContent = faixas[indice].t;
    barra.style.transform = 'scaleX(0)';
    const radio = doc.getElementById(`faixa-${indice}`);
    if (radio) radio.checked = true;
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: faixas[indice].t, artist: 'Revisão' });
    }
}

function proxima(dir) {
    carregar((indiceAtual + faixas.length + dir) % faixas.length);
    tocar();
}

doc.getElementById('acao').onclick = alternar;
doc.getElementById('voltar').onclick = () => proxima(-1);
doc.getElementById('pular').onclick = () => proxima(1);

audio.onerror = () => {
    titulo.textContent = 'Erro ao carregar áudio';
    atualizarIcone(false);
    const inputAtual = doc.getElementById(`faixa-${indiceAtual}`);
    if (inputAtual?.nextElementSibling) inputAtual.nextElementSibling.classList.add('erro');
};

barraArea.onclick = (e) => {
    if (!duracao) return;
    const r = barraArea.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    audio.currentTime = pct * duracao;
    if (audio.paused) barra.style.transform = `scaleX(${pct})`;
};

lista.onchange = (e) => {
    if (e.target.name === 'faixa') {
        carregar(parseInt(e.target.id.split('-')[1], 10));
        tocar();
    }
};

const frag = doc.createDocumentFragment();
faixas.forEach((f, i) => {
    const container = doc.createElement('div');
    const input = doc.createElement('input');
    input.type = 'radio'; input.name = 'faixa'; input.id = `faixa-${i}`; input.className = 'sr-only';
    const label = doc.createElement('label');
    label.setAttribute('for', `faixa-${i}`); label.className = 'item-audio'; label.textContent = `${i + 1}. ${f.t}`;
    container.appendChild(input);
    container.appendChild(label);
    frag.appendChild(container);
});
lista.appendChild(frag);

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => proxima(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => proxima(1));
    navigator.mediaSession.setActionHandler('play', tocar);
    navigator.mediaSession.setActionHandler('pause', pausar);
}

carregar(0);