'use strict';

// shared-config:start
const CRABCARE_CONFIG = {
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
    "STORAGE_KEY": "crabcare.reports.v1"
};
// shared-config:end

// demo-data:start
const CRABCARE_DEMO = {
    "version": 1,
    "defaultPatientId": "paciente1",
    "defaultDoctorId": "medico1",
    "doctors": [
        {
            "id": "medico1",
            "name": "Médico 1"
        }
    ],
    "patients": [
        {
            "id": "paciente1",
            "name": "Paciente 1",
            "doctorId": "medico1",
            "minutesAgo": 0,
            "report": {
                "pain": null,
                "symptoms": null,
                "nutrition": null,
                "doses": null
            }
        },
        {
            "id": "paciente2",
            "name": "Paciente 2",
            "doctorId": "medico1",
            "minutesAgo": 15,
            "report": {
                "pain": "dor_intensa",
                "symptoms": [
                    "Febre",
                    "Enjoo"
                ],
                "nutrition": "Comi pouco",
                "doses": [
                    "0:12:00",
                    "1:08:00"
                ]
            }
        },
        {
            "id": "paciente3",
            "name": "Paciente 3",
            "doctorId": "medico1",
            "minutesAgo": 35,
            "report": {
                "pain": "dor_moderada",
                "symptoms": [
                    "Cansaço"
                ],
                "nutrition": "Comi bem",
                "doses": [
                    "0:12:00",
                    "1:08:00",
                    "2:08:00"
                ]
            }
        },
        {
            "id": "paciente4",
            "name": "Paciente 4",
            "doctorId": "medico1",
            "minutesAgo": 55,
            "report": {
                "pain": "dor_muito_intensa",
                "symptoms": [
                    "Falta de ar"
                ],
                "nutrition": "Não consegui comer",
                "doses": [
                    "1:08:00"
                ]
            }
        },
        {
            "id": "paciente5",
            "name": "Paciente 5",
            "doctorId": "medico1",
            "minutesAgo": 80,
            "report": {
                "pain": "dor_leve",
                "symptoms": [
                    "Nenhum outro sintoma"
                ],
                "nutrition": "Comi bem",
                "doses": [
                    "0:12:00",
                    "1:08:00",
                    "2:08:00"
                ]
            }
        },
        {
            "id": "paciente6",
            "name": "Paciente 6",
            "doctorId": "medico1",
            "minutesAgo": 110,
            "report": {
                "pain": "sem_dor",
                "symptoms": [
                    "Enjoo",
                    "Sem apetite"
                ],
                "nutrition": "Comi pouco",
                "doses": [
                    "1:08:00",
                    "2:08:00"
                ]
            }
        }
    ]
};
// demo-data:end

(function () {
    const { PAIN_OPTIONS, STORAGE_KEY } = CRABCARE_CONFIG;
function evaluateReport(state) {
    const pain = PAIN_OPTIONS.find(option => option.value === state.pain);
    const symptoms = (state.symptoms || []).filter(value => value !== 'Nenhum outro sintoma');
    const fever = symptoms.includes('Febre');
    const breathing = symptoms.includes('Falta de ar');
    const parts = [...(pain ? [pain.label] : []), ...symptoms];
    const combination = parts.join(' + ');
    const critical = pain?.severity >= 4 || (pain?.severity >= 3 && (fever || breathing)) || (fever && breathing);
    if (critical) return {
        level: 'critical', title: 'Alerta de paciente crítico',
        reason: 'Combinação identificada: ' + combination + '.',
        combination, status: 'Atenção prioritária',
        action: 'Simular chamada da equipe',
        plan: 'Compartilhar com a equipe a dor e os sintomas informados.'
    };
    if (pain?.severity >= 2 || symptoms.length) return {
        level: 'attention', title: 'Alerta de atenção',
        reason: 'Combinação identificada: ' + combination + '.',
        combination, status: 'Relato precisa de atenção',
        action: 'Simular contato com a equipe',
        plan: 'Encaminhar o relato para acompanhamento da equipe.'
    };
    if (pain || state.symptoms) return {
        level: 'calm', title: 'Relato registrado', reason: combination || 'Nenhum outro sintoma informado.',
        combination, status: 'Registrado', action: '', plan: ''
    };
    return { level: 'pending', title: 'Escolha sua dor e seus sintomas', reason: '', combination: '', status: '', action: '', plan: '' };
}
    const SYMPTOMS = ['Cansaço', 'Enjoo', 'Falta de ar', 'Sonolência', 'Sem apetite', 'Febre', 'Nenhum outro sintoma'];
    const NUTRITION = ['Comi bem', 'Comi pouco', 'Não consegui comer'];
    function identity(value) { return String(value || '').trim().toLocaleLowerCase('pt-BR').slice(0, 80); }
    function getPatientProfile(value) {
        const key = identity(value);
        if (key === 'paciente') return CRABCARE_DEMO.patients.find(patient => patient.id === CRABCARE_DEMO.defaultPatientId);
        return CRABCARE_DEMO.patients.find(patient => identity(patient.id) === key || identity(patient.name) === key) || null;
    }
    function getDoctorProfile(value) {
        const key = identity(value);
        if (key === 'medico') return CRABCARE_DEMO.doctors.find(doctor => doctor.id === CRABCARE_DEMO.defaultDoctorId);
        return CRABCARE_DEMO.doctors.find(doctor => identity(doctor.id) === key || identity(doctor.name) === key) || null;
    }
    function normalizeContact(request) {
        if (!request || typeof request !== 'object' || !['pending', 'contacted'].includes(request.status) || typeof request.combination !== 'string' || typeof request.requestedAt !== 'string' || !Number.isFinite(Date.parse(request.requestedAt))) return null;
        return { combination: request.combination.slice(0, 600), requestedAt: request.requestedAt, status: request.status, contactedAt: typeof request.contactedAt === 'string' ? request.contactedAt : null, doctorId: typeof request.doctorId === 'string' ? request.doctorId.slice(0, 80) : null };
    }
    function combinationKey(record) {
        return JSON.stringify([record.id || record.patientId || getPatientProfile(record.patient)?.id, record.pain || null, [...(record.symptoms || [])].sort()]);
    }
    function normalize(record) {
        if (!record || typeof record !== 'object' || typeof record.patient !== 'string' || !record.patient.trim()) return null;
        const profile = getPatientProfile(record.id || record.patientId || record.patient);
        const updatedAt = typeof record.updatedAt === 'string' && Number.isFinite(Date.parse(record.updatedAt)) ? record.updatedAt : null;
        if (!updatedAt) return null;
        const symptoms = Array.isArray(record.symptoms) ? [...new Set(record.symptoms.filter(value => SYMPTOMS.includes(value)))] : null;
        if (symptoms?.includes('Nenhum outro sintoma') && symptoms.length > 1) symptoms.splice(symptoms.indexOf('Nenhum outro sintoma'), 1);
        const pain = PAIN_OPTIONS.some(option => option.value === record.pain) ? record.pain : null;
        const nutrition = NUTRITION.includes(record.nutrition) ? record.nutrition : null;
        const doses = Array.isArray(record.doses) ? record.doses.filter(value => typeof value === 'string' && /^[0-2]:\d{2}:\d{2}$/.test(value)) : null;
        return {
            id: profile?.id || identity(record.id || record.patient),
            patient: profile?.name || record.patient.trim().slice(0, 80),
            doctorId: profile?.doctorId || (getDoctorProfile(record.doctorId)?.id ?? CRABCARE_DEMO.defaultDoctorId),
            pain, symptoms: symptoms?.length ? symptoms : null, nutrition, doses,
            hasReport: !!(pain || symptoms?.length || nutrition || doses?.length),
            recordedAt: typeof record.recordedAt === 'string' ? record.recordedAt.slice(0, 40) : null,
            updatedAt,
            reviewedFor: typeof record.reviewedFor === 'string' ? record.reviewedFor : null,
            reviewedAt: typeof record.reviewedAt === 'string' ? record.reviewedAt : null,
            reviewedBy: typeof record.reviewedBy === 'string' ? record.reviewedBy.slice(0, 80) : null,
            contactRequest: normalizeContact(record.contactRequest),
            careActions: Array.isArray(record.careActions) ? record.careActions.filter(action => action && typeof action.label === 'string' && typeof action.at === 'string').slice(-10).map(action => ({ label: action.label.slice(0, 150), at: action.at, doctorId: typeof action.doctorId === 'string' ? action.doctorId : CRABCARE_DEMO.defaultDoctorId })) : []
        };
    }
    function readStoredReports() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        if (data.version !== 1 || !Array.isArray(data.reports)) throw new Error('Formato de armazenamento não reconhecido.');
        const unique = new Map();
        data.reports.map(normalize).filter(Boolean).forEach(record => {
            const previous = unique.get(record.id);
            if (!previous || record.updatedAt > previous.updatedAt) unique.set(record.id, record);
        });
        return [...unique.values()];
    }
    function writeReports(reports) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, reports }));
    }
    function initializeDemo() {
        const records = readStoredReports();
        const ids = new Set(records.map(record => record.id));
        let changed = false;
        const now = Date.now();
        CRABCARE_DEMO.patients.forEach(profile => {
            if (ids.has(profile.id)) return;
            const date = new Date(now - Math.max(0, Number(profile.minutesAgo) || 0) * 60000);
            records.push(normalize({ ...profile.report, id: profile.id, patient: profile.name, doctorId: profile.doctorId, recordedAt: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date), updatedAt: date.toISOString() }));
            ids.add(profile.id);
            changed = true;
        });
        // Seed only missing patients. Saved reports and professional actions take precedence.
        if (changed) writeReports(records);
        return records;
    }
    function readReports(doctorId) {
        const records = initializeDemo();
        return doctorId ? records.filter(record => record.doctorId === doctorId) : records;
    }
    function getReport(value) {
        const id = getPatientProfile(value)?.id || identity(value);
        return readReports().find(record => record.id === id) || null;
    }
    function saveReport(report) {
        const profile = getPatientProfile(report.patientId || report.id || report.patient);
        if (!profile) throw new Error('Paciente não cadastrado na demonstração.');
        const records = readReports();
        const index = records.findIndex(record => record.id === profile.id);
        const previous = index < 0 ? {} : records[index];
        const next = normalize({
            ...previous, id: profile.id, patient: profile.name, doctorId: profile.doctorId,
            pain: report.pain, symptoms: report.symptoms, nutrition: report.nutrition,
            doses: report.doses, recordedAt: report.recordedAt,
            updatedAt: new Date(Math.max(Date.now(), (Date.parse(previous.updatedAt) || 0) + 1)).toISOString()
        });
        if (!next) throw new Error('Registro inválido.');
        if (next.contactRequest && next.contactRequest.combination !== combinationKey(next)) next.contactRequest = null;
        if (index < 0) records.push(next);
        else records[index] = next;
        writeReports(records);
        return next;
    }
    function reviewReport(id, expectedUpdatedAt, label, doctorId) {
        const profile = getDoctorProfile(doctorId);
        if (!profile) throw new Error('Médico não cadastrado na demonstração.');
        const records = readReports();
        const record = records.find(item => item.id === id && item.doctorId === profile.id);
        if (!record) throw new Error('O registro não está disponível para este médico.');
        if (!record.hasReport) throw new Error('O paciente ainda não enviou um relato.');
        if (record.updatedAt !== expectedUpdatedAt) throw new Error('O paciente atualizou o relato. Revise os novos dados antes de registrar a ação.');
        const now = new Date().toISOString();
        record.reviewedFor = record.updatedAt;
        record.reviewedAt = now;
        record.reviewedBy = profile.id;
        if (label) record.careActions = [...record.careActions, { label, at: now, doctorId: profile.id }].slice(-10);
        writeReports(records);
        return record;
    }
    function requestContact(patient) {
        const records = readReports();
        const id = getPatientProfile(patient)?.id;
        const record = records.find(item => item.id === id);
        if (!record?.hasReport) throw new Error('Registre sua dor e seus sintomas antes de solicitar contato.');
        const combination = combinationKey(record);
        if (record.contactRequest?.status === 'pending' && record.contactRequest.combination === combination) return record;
        record.contactRequest = { combination, requestedAt: new Date(Math.max(Date.now(), (Date.parse(record.contactRequest?.requestedAt) || 0) + 1)).toISOString(), status: 'pending', contactedAt: null, doctorId: null };
        writeReports(records);
        return record;
    }
    function respondContact(patientId, requestedAt, doctorId) {
        const profile = getDoctorProfile(doctorId);
        const records = readReports();
        const record = records.find(item => item.id === patientId && item.doctorId === profile?.id);
        if (!profile || !record) throw new Error('Registro não disponível para este médico.');
        if (!record.contactRequest || record.contactRequest.requestedAt !== requestedAt || record.contactRequest.status !== 'pending') throw new Error('A solicitação de contato mudou. Atualize o relato.');
        const now = new Date().toISOString();
        record.contactRequest = { ...record.contactRequest, status: 'contacted', contactedAt: now, doctorId: profile.id };
        record.reviewedAt = now;
        record.reviewedFor = record.updatedAt;
        record.reviewedBy = profile.id;
        record.careActions = [...record.careActions, { label: 'Contato com o paciente registrado na demonstração', at: now, doctorId: profile.id }].slice(-10);
        writeReports(records);
        return record;
    }
    window.Crabcare = Object.freeze({ STORAGE_KEY, PAIN_OPTIONS, DEFAULT_PATIENT_ID: CRABCARE_DEMO.defaultPatientId, DEFAULT_DOCTOR_ID: CRABCARE_DEMO.defaultDoctorId, getPatientProfile, getDoctorProfile, initializeDemo, evaluateReport, readReports, getReport, saveReport, reviewReport, combinationKey, requestContact, respondContact });
})();
