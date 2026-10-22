'use strict';

const doctor = { id: null, reports: [], selectedId: null, filter: 'all', loggedIn: false };
const docApp = document.getElementById('doc-app');
const docLogin = document.getElementById('doc-login');
const levels = { critical: 0, attention: 1, calm: 2, pending: 3 };
function formatDate(value) {
    if (!value || !Number.isFinite(Date.parse(value))) return 'Não informado';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
function docMessage(text) {
    const element = document.getElementById('doc-feedback');
    element.textContent = text;
    element.hidden = !text;
}
function selectedReport() { return doctor.reports.find(record => record.id === doctor.selectedId); }
function renderDoctor() {
    const enriched = doctor.reports.map(record => ({ record, alert: Crabcare.evaluateReport(record) }));
    enriched.sort((a, b) => levels[a.alert.level] - levels[b.alert.level] || b.record.updatedAt.localeCompare(a.record.updatedAt));
    const alerts = enriched.filter(item => ['critical', 'attention'].includes(item.alert.level));
    document.getElementById('doc-total').textContent = enriched.length;
    document.getElementById('doc-alerts').textContent = alerts.length;
    document.getElementById('doc-new').textContent = doctor.reports.filter(record => record.hasReport && record.reviewedFor !== record.updatedAt).length;
    const visible = doctor.filter === 'alerts' ? alerts : enriched;
    const empty = document.getElementById('doc-empty');
    empty.hidden = visible.length > 0;
    empty.querySelector('h2').textContent = doctor.filter === 'alerts' && enriched.length ? 'Nenhum alerta nesta combinação de relatos' : 'Aguardando o primeiro relato';
    empty.querySelector('p').textContent = doctor.filter === 'alerts' && enriched.length ? 'Os pacientes continuam disponíveis em Meus pacientes.' : 'Os registros feitos pelo paciente aparecerão aqui automaticamente.';
    if (!visible.some(item => item.record.id === doctor.selectedId)) doctor.selectedId = visible[0]?.record.id || null;
    const list = document.getElementById('doc-patients');
    list.replaceChildren();
    visible.forEach(({ record, alert }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'doctor-patient';
        button.dataset.patient = record.id;
        button.dataset.level = alert.level;
        if (record.id === doctor.selectedId) button.setAttribute('aria-current', 'true');
        const name = document.createElement('strong');
        name.textContent = record.patient;
        const status = document.createElement('span');
        status.className = 'text-xs';
        status.textContent = record.hasReport ? (alert.status || 'Registro recebido') : 'Aguardando primeiro relato';
        const time = document.createElement('small');
        time.className = 'text-xs text-stone-400';
        time.textContent = record.hasReport ? formatDate(record.updatedAt) + (record.reviewedFor === record.updatedAt ? ' · Visto' : ' · Novo relato') : 'Sem respostas registradas';
        button.append(name, status, time);
        list.append(button);
    });
    document.querySelectorAll('[data-doc-action="all"], [data-doc-action="alerts"]').forEach(button => {
        if (button.dataset.docAction === doctor.filter) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });
    const article = document.getElementById('doc-report');
    const record = selectedReport();
    article.hidden = !record;
    if (!record) return;
    const alert = Crabcare.evaluateReport(record);
    article.dataset.level = alert.level;
    document.getElementById('doc-alert-title').textContent = ['critical', 'attention'].includes(alert.level) ? alert.title : 'Registro do paciente';
    document.getElementById('doc-reason').textContent = alert.reason || 'Relato recebido para acompanhamento.';
    document.getElementById('doc-plan').textContent = ['critical', 'attention'].includes(alert.level) ? 'Revisar a combinação informada e registrar o acompanhamento da equipe.' : 'Acompanhar o relato e as próximas atualizações do paciente.';
    const values = {
        patient: record.patient, status: record.hasReport ? (alert.status || 'Registro recebido') : 'Aguardando registro',
        pain: Crabcare.PAIN_OPTIONS.find(option => option.value === record.pain)?.label || 'Não informada',
        symptoms: record.symptoms?.join(', ') || 'Não informados',
        nutrition: record.nutrition || 'Não informada', updatedAt: record.hasReport ? formatDate(record.updatedAt) : 'Ainda não registrado',
        combination: alert.combination || 'Dor e sintomas ainda não informados.'
    };
    Object.entries(values).forEach(([key, value]) => document.querySelectorAll('[data-doc-bind="' + key + '"]').forEach(element => { element.textContent = value; }));
    const reviewed = record.reviewedFor === record.updatedAt;
    const reviewButton = document.getElementById('doc-review');
    reviewButton.disabled = reviewed || !record.hasReport;
    reviewButton.textContent = !record.hasReport ? 'Aguardando relato do paciente' : reviewed ? 'Relato visto' : 'Marcar relato como visto';
    document.querySelector('[data-doc-action="nursing"]').disabled = !record.hasReport;
    const reviewedText = document.getElementById('doc-reviewed');
    reviewedText.hidden = !reviewed;
    reviewedText.textContent = reviewed ? 'Visualizado em ' + formatDate(record.reviewedAt) : '';
    const activity = document.getElementById('doc-activity-list');
    activity.replaceChildren();
    record.careActions.forEach(action => {
        const item = document.createElement('li');
        item.textContent = formatDate(action.at) + ' · ' + action.label;
        activity.append(item);
    });
    document.getElementById('doc-activity').hidden = !record.careActions.length;
}
function refreshReports() {
    const error = document.getElementById('doc-storage-error');
    try {
        doctor.reports = Crabcare.readReports(doctor.id);
        error.hidden = true;
        renderDoctor();
        return true;
    } catch {
        doctor.reports = [];
        error.textContent = 'Não foi possível recuperar os registros neste navegador.';
        error.hidden = false;
        renderDoctor();
        return false;
    }
}
function reviewCurrent(label) {
    const record = selectedReport();
    if (!record) return;
    try {
        Crabcare.reviewReport(record.id, record.updatedAt, label, doctor.id);
        refreshReports();
        docMessage(label === 'Relato visualizado' ? 'Relato marcado como visto.' : 'Chamada da enfermagem registrada como simulação.');
    } catch (error) {
        refreshReports();
        docMessage(error.message);
    }
}
document.getElementById('doc-usuario').addEventListener('input', event => event.target.setCustomValidity(''));
document.getElementById('doc-login-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('doc-usuario');
    const profile = Crabcare.getDoctorProfile(input.value);
    if (!profile) {
        input.setCustomValidity('Use um médico da demonstração, como medico1.');
        input.reportValidity();
        return;
    }
    doctor.id = profile.id;
    doctor.selectedId = Crabcare.DEFAULT_PATIENT_ID;
    document.getElementById('doc-identity').textContent = profile.name;
    doctor.loggedIn = true;
    docLogin.hidden = true;
    docApp.hidden = false;
    refreshReports();
});
document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !doctor.loggedIn) return;
    if (button.dataset.patient) {
        doctor.selectedId = button.dataset.patient;
        document.getElementById('doc-record').hidden = true;
        document.querySelector('[data-doc-action="record"]').setAttribute('aria-expanded', 'false');
        renderDoctor();
        docMessage('');
        return;
    }
    switch (button.dataset.docAction) {
        case 'logout': doctor.loggedIn = false; docApp.hidden = true; docLogin.hidden = false; document.getElementById('doc-usuario').focus(); break;
        case 'refresh': if (refreshReports()) docMessage('Registros atualizados.'); break;
        case 'all': doctor.filter = 'all'; renderDoctor(); break;
        case 'alerts': doctor.filter = 'alerts'; renderDoctor(); break;
        case 'review': reviewCurrent('Relato visualizado'); break;
        case 'nursing': reviewCurrent('Chamada da enfermagem simulada'); break;
        case 'record': {
            const record = document.getElementById('doc-record');
            record.hidden = !record.hidden;
            button.setAttribute('aria-expanded', String(!record.hidden));
            break;
        }
    }
});
window.addEventListener('storage', event => {
    if (doctor.loggedIn && (event.key === Crabcare.STORAGE_KEY || event.key === null)) refreshReports();
});
window.addEventListener('focus', () => { if (doctor.loggedIn) refreshReports(); });
document.addEventListener('visibilitychange', () => { if (doctor.loggedIn && !document.hidden) refreshReports(); });
