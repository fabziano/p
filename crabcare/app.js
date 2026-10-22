'use strict';

// Catálogos compartilhados pelas telas e pelos componentes nativos.
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
    "MOOD_OPTIONS": [
        {
            "value": "bem",
            "label": "Estou bem",
            "face": "face-1"
        },
        {
            "value": "normal",
            "label": "Estou mais ou menos",
            "face": "face-3"
        },
        {
            "value": "mal",
            "label": "Não estou bem",
            "face": "face-5"
        }
    ],
    "TREND_OPTIONS": [
        {
            "value": "melhorando",
            "label": "Melhorando"
        },
        {
            "value": "igual",
            "label": "Continua igual"
        },
        {
            "value": "piorando",
            "label": "Piorando"
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
            "screen": "escala",
            "label": "Minha dor",
            "icon": "heart"
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
        "escala": "Minha dor"
    },
    "ICONS": {
        "home": "<path d=\"m3 10 9-7 9 7v10H5V10m5 10v-6h4v6\"/>",
        "user": "<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M4 22v-3a8 8 0 0 1 16 0v3\"/>",
        "bell": "<path d=\"M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3h4\"/>",
        "pill": "<path d=\"M9 4a5 5 0 0 1 7 7l-6 6a5 5 0 0 1-7-7zm-3 3 7 7\"/>",
        "heart": "<path d=\"M12 21 3 12a6 6 0 0 1 9-8 6 6 0 0 1 9 8Z\"/><path d=\"M3 12h5l2-4 3 8 2-4h6\"/>",
        "list": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 2h6v4H9zm0 9h6m-6 4h6m-6 4h4\"/>",
        "exit": "<path d=\"M10 4H4v16h6m4-12 4 4-4 4m-6-4h12\"/>",
        "thermometer": "<path d=\"M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z\"/><path d=\"M12 7v11m4-10h3m-3 4h3\"/>",
        "food": "<path d=\"M4 3v6m3-6v18M1 3v6a3 3 0 0 0 6 0m11-6v18m0-18c-5 4-5 10 0 10\"/>",
        "check": "<path d=\"m5 12 4 4L19 6\"/>",
        "arrow": "<path d=\"M4 12h16m-6-6 6 6-6 6\"/>"
    }
};
// catalog:end
const { PAIN_OPTIONS, MOOD_OPTIONS, TREND_OPTIONS, MEDICINES, NAVIGATION, SCREEN_TITLES, ICONS } = COMPONENTS;

// Somente memória da página: nenhuma credencial ou relato é enviado/persistido.
const state = { patient: 'paciente', pain: null, trend: null, mood: null, recordedAt: null };
const app = document.getElementById('aplicativo');
const login = document.getElementById('login');

function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
}
function icon(name) {
    return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
}
function populateIcons(root = document) {
    root.querySelectorAll('[data-ui-icon]').forEach(element => {
        // Apenas desenhos estáticos conhecidos; rostinhos vêm de icones.svg.
        element.innerHTML = icon(element.dataset.uiIcon);
    });
}
function faceOption(option, field, group) {
    const fragment = cloneTemplate('face-option-template');
    const input = fragment.querySelector('input');
    input.name = field + '-' + group;
    input.value = option.value;
    input.dataset.field = field;
    fragment.querySelector('use').setAttribute('href', '#' + option.face);
    fragment.querySelector('[data-label]').textContent = option.label;
    if (field === 'pain') fragment.querySelector('label').classList.add('pain-option');
    return fragment;
}
function mountComponents() {
    document.querySelectorAll('[data-component="header"]').forEach(element => {
        element.replaceChildren(cloneTemplate('header-template'));
    });
    document.querySelectorAll('[data-component="mood"]').forEach(element => {
        element.replaceChildren();
        MOOD_OPTIONS.forEach(option => element.append(faceOption(option, 'mood', element.dataset.group)));
    });
    const pain = document.querySelector('[data-component="pain"]');
    pain.replaceChildren();
    PAIN_OPTIONS.forEach(option => pain.append(faceOption(option, 'pain', 'escala')));
    const trend = document.querySelector('[data-component="trend"]');
    trend.replaceChildren();
    TREND_OPTIONS.forEach(option => {
        const label = document.createElement('label');
        label.className = 'choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'trend-escala';
        input.dataset.field = 'trend';
        input.value = option.value;
        input.required = true;
        label.append(input, document.createTextNode(option.label));
        trend.append(label);
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
        const label = document.createElement('span');
        label.textContent = item.label;
        button.append(label);
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
    populateIcons();
}

// Regra visual do MVP: prioridade crítica antes da checagem de completude.
// Assim, uma dor muito intensa não aparece como "sem alerta" por faltar bem-estar.
function evaluateReport(report) {
    const pain = PAIN_OPTIONS.find(option => option.value === report.pain);
    if (pain && (pain.severity >= 4 || (pain.severity === 3 && (report.trend === 'piorando' || report.mood === 'mal')))) {
        return {
            level: 'critical', title: 'Alerta de dor crítica', shortStatus: 'Alerta crítico nesta combinação',
            reason: pain.severity >= 4
                ? pain.label + ' informada no relato. Esta intensidade aciona o alerta crítico da demonstração.'
                : 'Dor intensa combinada com ' + (report.trend === 'piorando' ? 'piora da dor' : '“Não estou bem”') + '.',
            plan: ['Simular o contato com a equipe de cuidado.', 'Compartilhar a intensidade, a evolução e o bem-estar relatados.', 'Aguardar a avaliação da equipe e atualizar o relato se houver mudança.'],
            action: 'Simular chamada da equipe'
        };
    }
    const missing = [];
    if (!pain) missing.push('intensidade');
    if (!report.trend) missing.push('evolução');
    if (!report.mood) missing.push('bem-estar');
    if (missing.length) {
        return {
            level: 'pending', title: 'Complete seu registro', shortStatus: 'Falta completar o relato',
            reason: 'Ainda falta informar: ' + missing.join(', ') + '.',
            plan: ['Selecionar a intensidade da dor.', 'Informar se a dor melhorou, permaneceu igual ou piorou.', 'Escolher como você está se sentindo para completar a combinação.'],
            action: 'Completar meu registro'
        };
    }
    if (pain.severity >= 2 || report.trend === 'piorando' || report.mood === 'mal') {
        const reasons = [];
        if (pain.severity >= 2) reasons.push(pain.label.toLowerCase());
        if (report.trend === 'piorando') reasons.push('piora da dor');
        if (report.mood === 'mal') reasons.push('“Não estou bem”');
        return {
            level: 'attention', title: 'Seu relato precisa de atenção', shortStatus: 'Atenção nesta combinação',
            reason: 'Combinação registrada: ' + reasons.join(' + ') + '.',
            plan: ['Compartilhar o relato com a equipe de cuidado na demonstração.', 'Acompanhar como a dor evolui.', 'Atualizar as respostas caso a intensidade ou o bem-estar mudem.'],
            action: 'Simular envio do relato'
        };
    }
    return {
        level: 'calm', title: 'Sem alerta nesta combinação', shortStatus: 'Sem alerta nesta combinação',
        reason: pain.label + ', ' + (report.trend === 'melhorando' ? 'melhorando' : 'sem piora') + ' e relato de bem-estar: ' + (report.mood === 'bem' ? '“Estou bem”' : '“Estou mais ou menos”') + '.',
        plan: ['Manter o relato atualizado.', 'Registrar novamente se a dor ou o bem-estar mudarem.', 'Consultar os horários da agenda de medicamentos.'],
        action: 'Ver meus medicamentos'
    };
}
function bindText(name, text) {
    document.querySelectorAll('[data-bind="' + name + '"]').forEach(element => { element.textContent = text; });
}
function renderReport() {
    const result = evaluateReport(state);
    const pain = PAIN_OPTIONS.find(option => option.value === state.pain);
    const trend = TREND_OPTIONS.find(option => option.value === state.trend);
    const mood = MOOD_OPTIONS.find(option => option.value === state.mood);
    const values = {
        patient: state.patient,
        painLabel: pain?.label || 'Não informada',
        trendLabel: trend?.label || 'Não informada',
        moodLabel: mood?.label || 'Não informado',
        recordedAt: state.recordedAt || 'Ainda não registrado',
        title: result.title, shortStatus: result.shortStatus, reason: result.reason,
        summary: [pain?.label || 'Dor não informada', trend?.label || 'Evolução não informada', mood?.label || 'Bem-estar não informado'].join(' · ')
    };
    Object.entries(values).forEach(([name, text]) => bindText(name, text));
    document.querySelector('[data-component="alert"]').dataset.level = result.level;
    document.querySelectorAll('[data-alert-dot]').forEach(dot => { dot.dataset.level = result.level; });
    const plan = document.getElementById('action-plan');
    plan.replaceChildren(...result.plan.map(text => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
    }));
    document.getElementById('alert-action').textContent = result.action;
    document.querySelectorAll('input[data-field]').forEach(input => {
        input.checked = state[input.dataset.field] === input.value;
    });
}
function feedback(text) {
    const element = document.getElementById('app-feedback');
    element.textContent = text;
    element.hidden = false;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showScreen(id) {
    if (!SCREEN_TITLES[id]) return;
    app.classList.remove('preview-grid');
    document.querySelectorAll('[data-page]').forEach(page => { page.hidden = page.id !== id; });
    document.querySelectorAll('.nav-item[data-screen]').forEach(button => {
        if (button.dataset.screen === id) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });
    document.getElementById('app-feedback').hidden = true;
    document.title = 'Crabcare — ' + SCREEN_TITLES[id];
    const heading = document.getElementById(id).querySelector('h1');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
}
function logout() {
    app.hidden = true;
    login.hidden = false;
    document.title = 'Crabcare — Entrar';
    document.getElementById('usuario').focus();
}
function updateDoses() {
    const total = MEDICINES.length;
    const count = MEDICINES.filter((_, index) => document.querySelector('input[data-medicine="' + index + '"]:checked')).length;
    document.getElementById('dose-text').textContent = count + ' de ' + total + ' medicamentos';
    document.getElementById('dose-count').textContent = count + '/' + total;
    const progress = document.getElementById('dose-progress');
    progress.max = total;
    progress.value = count;
}
function playPainAudio(value) {
    const audio = document.getElementById('audio-player');
    audio.src = 'assets/audio/' + value + '.mp3';
    audio.play().catch(() => { /* A seleção continua funcionando sem áudio. */ });
}
function simulateTeamContact() {
    const result = evaluateReport(state);
    feedback('Simulação: equipe avisada sobre o relato de ' + state.patient + '. Estado atual: ' + result.shortStatus.toLowerCase() + '.');
}

mountComponents();
renderReport();
updateDoses();

document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();
    const patient = document.getElementById('usuario').value.trim() || 'paciente';
    if (patient !== state.patient) {
        Object.assign(state, { pain: null, trend: null, mood: null, recordedAt: null });
        document.getElementById('mood-feedback').textContent = '';
    }
    state.patient = patient;
    login.hidden = true;
    app.hidden = false;
    renderReport();
    showScreen('inicio');
});
document.getElementById('pain-form').addEventListener('submit', event => {
    event.preventDefault();
    showScreen('painel');
});
document.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('input[data-field]')) {
        state[input.dataset.field] = input.value;
        state.recordedAt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
        document.getElementById('app-feedback').hidden = true;
        renderReport();
        if (input.dataset.field === 'mood') {
            document.getElementById('mood-feedback').textContent = {
                bem: 'Que bom! Complete seu relato de dor para acompanhar o painel.',
                normal: 'Obrigado por compartilhar. Como está sua dor?',
                mal: 'Conte também a intensidade e a evolução da sua dor.'
            }[input.value];
        }
        if (input.dataset.field === 'pain') playPainAudio(input.value);
    }
    if (input.matches('input[data-medicine]')) updateDoses();
});
document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.screen) return showScreen(button.dataset.screen);
    switch (button.dataset.action) {
        case 'logout': logout(); break;
        case 'profile': feedback('Perfil de demonstração: ' + state.patient + '.'); break;
        case 'food': document.getElementById('alimentacao-dialog').showModal(); break;
        case 'record': {
            const record = document.getElementById('registro-detalhes');
            record.hidden = !record.hidden;
            button.setAttribute('aria-expanded', String(!record.hidden));
            break;
        }
        case 'team': simulateTeamContact(); break;
        case 'alert-primary': {
            const result = evaluateReport(state);
            if (result.level === 'pending') showScreen('escala');
            else if (result.level === 'calm') showScreen('medicamentos');
            else simulateTeamContact();
            break;
        }
    }
});

// A demonstração compartilha exatamente os componentes e regras do aplicativo.
if (document.body.dataset.preview === 'true') {
    login.hidden = true;
    app.hidden = false;
    app.classList.add('preview-grid');
    document.querySelectorAll('[data-page]').forEach(page => { page.hidden = false; });
    document.title = 'Crabcare — Demonstração';
}
