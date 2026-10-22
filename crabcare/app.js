'use strict';

// Catálogos de componentes, sem alterar os SVGs dos rostinhos.
// catalog:start
const COMPONENTS = {
    "PAIN_OPTIONS": [
        {
            "value": "sem_dor",
            "label": "Sem dor",
            "face": "face-1",
            "severity": 0
        },
        {
            "value": "dor_leve",
            "label": "Dor leve",
            "face": "face-2",
            "severity": 1
        },
        {
            "value": "dor_moderada",
            "label": "Dor moderada",
            "face": "face-3",
            "severity": 2
        },
        {
            "value": "dor_intensa",
            "label": "Dor intensa",
            "face": "face-4",
            "severity": 3
        },
        {
            "value": "dor_muito_intensa",
            "label": "Dor muito intensa",
            "face": "face-4-intensa",
            "severity": 4
        },
        {
            "value": "pior_dor_possivel",
            "label": "Pior dor possível",
            "face": "face-5",
            "severity": 5
        }
    ],
    "MEDICINES": [
        {
            "name": "Morfina 10 mg",
            "frequency": "Tomar a cada 6 horas",
            "interval": "6/6 h",
            "color": "blue",
            "times": [
                "00:00",
                "06:00",
                "12:00",
                "18:00"
            ],
            "checked": [
                "12:00"
            ]
        },
        {
            "name": "Ondansetrona 8 mg",
            "frequency": "Tomar a cada 8 horas",
            "interval": "8/8 h",
            "color": "orange",
            "times": [
                "08:00",
                "16:00",
                "00:00"
            ],
            "checked": [
                "08:00"
            ]
        },
        {
            "name": "Pregabalina 75 mg",
            "frequency": "Tomar a cada 12 horas",
            "interval": "12/12 h",
            "color": "green",
            "times": [
                "08:00",
                "20:00"
            ],
            "checked": [
                "08:00"
            ]
        }
    ],
    "NAVIGATION": [
        {
            "screen": "inicio",
            "label": "Início",
            "icon": "home"
        },
        {
            "screen": "painel",
            "label": "Meu painel",
            "icon": "list"
        },
        {
            "screen": "medicamentos",
            "label": "Medicamentos",
            "icon": "pill"
        },
        {
            "screen": "sintomas",
            "label": "Sintomas",
            "icon": "thermometer"
        },
        {
            "action": "logout",
            "label": "Sair",
            "icon": "exit"
        }
    ],
    "SCREEN_TITLES": {
        "inicio": "Boas-vindas",
        "painel": "Meu painel",
        "medicamentos": "Medicamentos",
        "sintomas": "Sintomas",
        "alimentacao": "Alimentação"
    },
    "ICONS": {
        "home": "<path d=\"m3 10 9-7 9 7v10H5V10m5 10v-6h4v6\"/>",
        "user": "<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M4 22v-3a8 8 0 0 1 16 0v3\"/>",
        "bell": "<path d=\"M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3h4\"/>",
        "pill": "<path d=\"M9 4a5 5 0 0 1 7 7l-6 6a5 5 0 0 1-7-7zm-3 3 7 7\"/>",
        "heart": "<path d=\"M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z\"/><path d=\"M3 12h4l2-4 4 8 2-4h6\"/>",
        "list": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 2h6v4H9zm0 9h6m-6 4h6m-6 4h4\"/>",
        "exit": "<path d=\"M10 4H4v16h6m4-12 4 4-4 4m-6-4h12\"/>",
        "thermometer": "<path d=\"M7 14.7V5a3 3 0 0 1 6 0v9.7a5 5 0 1 1-6 0Z\"/><path d=\"M10 8v10m7-12h4m-4 4h3m-3 4h4\"/><circle cx=\"10\" cy=\"18.5\" r=\"1.5\" fill=\"currentColor\" stroke=\"none\"/>",
        "food": "<path d=\"M4 3v5a2 2 0 0 0 4 0V3M6 3v18m13 0V3c-3 2-4 5-4 9h4\"/>",
        "check": "<path d=\"m5 12 4 4L19 6\"/>",
        "arrow": "<path d=\"M4 12h16m-6-6 6 6-6 6\"/>"
    }
};
// catalog:end
const { PAIN_OPTIONS, MEDICINES, NAVIGATION, SCREEN_TITLES, ICONS } = COMPONENTS;
const state = { patient: 'paciente', pain: null, recordedAt: null, symptoms: null, nutrition: null };
const app = document.getElementById('aplicativo');
const login = document.getElementById('login');

function cloneTemplate(id) { return document.getElementById(id).content.cloneNode(true); }
function icon(name) { return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>'; }
function mountComponents() {
    document.querySelectorAll('[data-component="header"]').forEach(element => element.replaceChildren(cloneTemplate('header-template')));
    const pain = document.querySelector('[data-component="pain"]');
    pain.replaceChildren();
    PAIN_OPTIONS.forEach(option => {
        const fragment = cloneTemplate('face-option-template');
        const input = fragment.querySelector('input');
        input.name = 'pain-inicio';
        input.value = option.value;
        input.dataset.field = 'pain';
        fragment.querySelector('label').classList.add('pain-option');
        fragment.querySelector('use').setAttribute('href', '#' + option.face);
        fragment.querySelector('[data-label]').textContent = option.label;
        pain.append(fragment);
    });
    const nav = document.querySelector('[data-component="navigation"]');
    nav.replaceChildren();
    NAVIGATION.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-item';
        if (item.screen) button.dataset.screen = item.screen;
        else button.dataset.action = item.action;
        button.innerHTML = icon(item.icon);
        const text = document.createElement('span');
        text.textContent = item.label;
        button.append(text);
        nav.append(button);
    });
    const medicines = document.querySelector('[data-component="medicines"]');
    medicines.replaceChildren();
    MEDICINES.forEach((medicine, index) => {
        const fragment = cloneTemplate('medicine-template');
        fragment.querySelector('[data-name]').textContent = medicine.name;
        fragment.querySelector('[data-frequency]').textContent = medicine.frequency;
        fragment.querySelector('[data-interval]').textContent = medicine.interval;
        fragment.querySelector('[data-color]').dataset.color = medicine.color;
        medicine.times.forEach(time => {
            const label = document.createElement('label');
            label.className = 'dose';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.dataset.medicine = index;
            input.checked = medicine.checked.includes(time);
            input.setAttribute('aria-label', medicine.name + ', dose das ' + time);
            const mark = document.createElement('span');
            mark.className = 'dose-mark';
            mark.setAttribute('aria-hidden', 'true');
            mark.innerHTML = icon('check');
            const timeElement = document.createElement('time');
            timeElement.className = 'text-xs';
            timeElement.dateTime = time;
            timeElement.textContent = time;
            label.append(input, mark, timeElement);
            fragment.querySelector('[data-times]').append(label);
        });
        medicines.append(fragment);
    });

    document.querySelectorAll('[data-ui-icon]').forEach(element => { element.innerHTML = icon(element.dataset.uiIcon); });
}

// Estados visuais do MVP, definidos somente pela escala de dor existente.
function evaluateReport() {
    const pain = PAIN_OPTIONS.find(option => option.value === state.pain);
    if (!pain) return { level: 'pending', title: 'Como está sua dor?', reason: 'Escolha um rostinho na tela inicial.', action: 'Ver escala de dor' };
    if (pain.severity >= 4) return { level: 'critical', title: 'Alerta de dor intensa', reason: pain.label + '. Seu relato precisa de atenção da equipe.', action: 'Simular contato com a equipe' };
    if (pain.severity >= 2) return { level: 'attention', title: 'Atenção à sua dor', reason: pain.label + ' registrada.', action: 'Simular contato com a equipe' };
    return { level: 'calm', title: 'Dor registrada', reason: pain.label + '.', action: 'Atualizar minha dor' };
}
function bindText(name, text) {
    document.querySelectorAll('[data-bind="' + name + '"]').forEach(element => { element.textContent = text; });
}
function renderReport() {
    const result = evaluateReport();
    const pain = PAIN_OPTIONS.find(option => option.value === state.pain);
    const values = {
        patient: state.patient, title: result.title, shortStatus: result.title, reason: result.reason,
        painLabel: pain?.label || 'Ainda não informada', recordedAt: state.recordedAt || 'Ainda não registrado',
        symptomSummary: state.symptoms ? state.symptoms.join(', ') : 'Ainda não informado',
        nutritionSummary: state.nutrition || 'Ainda não informada'
    };
    Object.entries(values).forEach(([key, value]) => bindText(key, value));
    document.querySelector('[data-component="alert"]').dataset.level = result.level;
    document.querySelectorAll('[data-alert-dot]').forEach(dot => { dot.dataset.level = result.level; });
    document.getElementById('alert-action').textContent = result.action;
    document.querySelectorAll('input[data-field="pain"]').forEach(input => { input.checked = input.value === state.pain; });
}
function showScreen(id) {
    if (!SCREEN_TITLES[id]) return;
    app.classList.remove('preview-grid');
    document.querySelectorAll('[data-page]').forEach(page => { page.hidden = page.id !== id; });
    document.querySelectorAll('.nav-item[data-screen]').forEach(button => {
        if (button.dataset.screen === (id === 'alimentacao' ? 'inicio' : id)) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });
    document.getElementById('app-feedback').hidden = true;
    document.title = 'Crabcare — ' + SCREEN_TITLES[id];
    const heading = document.getElementById(id).querySelector('h1');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
}
function feedback(text) {
    const element = document.getElementById('app-feedback');
    element.textContent = text;
    element.hidden = false;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function updateDoses() {
    const total = MEDICINES.length;
    const count = MEDICINES.filter((_, index) => document.querySelector('input[data-medicine="' + index + '"]:checked')).length;
    document.getElementById('dose-text').textContent = count + ' de ' + total + ' medicamentos';
    document.getElementById('dose-count').textContent = count + '/' + total;
    document.getElementById('dose-progress').max = total;
    document.getElementById('dose-progress').value = count;
}
function goToPain() {
    showScreen('inicio');
    document.getElementById('home-pain-form').scrollIntoView({ block: 'center', behavior: 'smooth' });
}
mountComponents();
renderReport();
updateDoses();

document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();
    const patient = document.getElementById('usuario').value.trim() || 'paciente';
    if (patient !== state.patient) {
        Object.assign(state, { pain: null, recordedAt: null, symptoms: null, nutrition: null });
        document.querySelectorAll('input[name="sintoma"], input[name="alimentacao"]').forEach(input => { input.checked = false; });
        document.getElementById('symptoms-feedback').textContent = '';
        document.getElementById('nutrition-feedback').textContent = '';
    }
    state.patient = patient;
    login.hidden = true;
    app.hidden = false;
    renderReport();
    showScreen('inicio');
});
document.getElementById('home-pain-form').addEventListener('submit', event => { event.preventDefault(); showScreen('painel'); });
document.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[data-field="pain"]')) {
        state.pain = input.value;
        state.recordedAt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
        renderReport();
    }
    if (input.matches('input[name="sintoma"]')) {
        if (input.checked) document.querySelectorAll('input[name="sintoma"]').forEach(option => {
            if ((input.value === 'Nenhum outro sintoma' && option !== input) || (input.value !== 'Nenhum outro sintoma' && option.value === 'Nenhum outro sintoma')) option.checked = false;
        });
        const selected = [...document.querySelectorAll('input[name="sintoma"]:checked')];
        state.symptoms = selected.length ? selected.map(option => option.value) : null;
        document.getElementById('symptoms-feedback').textContent = selected.length ? 'Registrado.' : '';
        renderReport();
    }
    if (input.matches('input[name="alimentacao"]')) {
        state.nutrition = input.value;
        document.getElementById('nutrition-feedback').textContent = 'Registrado.';
        renderReport();
    }
    if (input.matches('input[data-medicine]')) updateDoses();
});
document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.screen) return showScreen(button.dataset.screen);
    switch (button.dataset.action) {
        case 'pain': goToPain(); break;
        case 'logout': app.hidden = true; login.hidden = false; document.title = 'Crabcare — Entrar'; document.getElementById('usuario').focus(); break;
        case 'profile': feedback('Perfil de demonstração: ' + state.patient + '.'); break;
        case 'alert-primary': {
            const result = evaluateReport();
            if (result.level === 'pending' || result.level === 'calm') goToPain();
            else feedback('Simulação: relato de dor compartilhado com a equipe.');
            break;
        }
    }
});
if (document.body.dataset.preview === 'true') {
    login.hidden = true;
    app.hidden = false;
    app.classList.add('preview-grid');
    document.querySelectorAll('[data-page]').forEach(page => { page.hidden = false; });
    document.title = 'Crabcare — Demonstração';
}
