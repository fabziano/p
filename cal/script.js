'use strict';

class DateUtils {
  static parseDateString(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(2000 + year, month - 1, day);
  }

  static getStartOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static isPastDate(targetDate, referenceDate = new Date()) {
    const target = this.getStartOfDay(targetDate);
    const reference = this.getStartOfDay(referenceDate);
    return target < reference;
  }
}

class AgendaManager {
  constructor(agendaData) {
    this.agendaData = agendaData;
  }

  getNextEvent(referenceDate = new Date()) {
    const today = DateUtils.getStartOfDay(referenceDate);

    for (const monthKey of Object.keys(this.agendaData)) {
      for (const item of this.agendaData[monthKey]) {
        if (!item.compromisso) continue;

        const itemDate = DateUtils.parseDateString(item.data);
        if (itemDate > today) {
          return { event: item, date: itemDate };
        }
      }
    }
    return null;
  }
}

class CalendarUI {
  static MONTH_NAMES = {
    '9': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro'
  };

  constructor(selectors) {
    this.elements = {
      calendarContainer: document.getElementById(selectors.calendar),
      todayDisplay: document.getElementById(selectors.todayDisplay),
      nextEventDisplay: document.getElementById(selectors.nextEventDisplay),
      countdownDisplay: document.getElementById(selectors.countdownDisplay)
    };
  }

  renderTodayDate(now = new Date()) {
    this.elements.todayDisplay.textContent = now.toLocaleDateString('pt-BR');
  }

  renderCountdown(now = new Date()) {
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const diffMs = Math.max(0, endOfDay - now);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    this.elements.countdownDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }

  renderNextEvent(nextEventData, referenceDate = new Date()) {
    if (!nextEventData) {
      this.elements.nextEventDisplay.textContent = 'Nenhum próximo compromisso';
      return;
    }

    const today = DateUtils.getStartOfDay(referenceDate);
    const diffMs = nextEventData.date - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const daysText = diffDays === 1 ? '1 dia' : `${diffDays} dias`;

    this.elements.nextEventDisplay.textContent = `Faltam ${daysText} para ${nextEventData.event.compromisso}`;
  }

  renderCalendar(agendaData, now = new Date()) {
    this.elements.calendarContainer.innerHTML = '';

    Object.entries(agendaData).forEach(([monthId, items]) => {
      const section = this.createMonthSection(monthId, items, now);
      this.elements.calendarContainer.appendChild(section);
    });
  }

  createMonthSection(monthId, items, now) {
    const section = document.createElement('section');
    section.className = 'month-section';

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    const table = document.createElement('table');
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const th = document.createElement('th');
    th.setAttribute('colspan', '3');
    th.textContent = CalendarUI.MONTH_NAMES[monthId] || `Mês ${monthId}`;
    headerRow.appendChild(th);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    items.forEach(item => {
      const row = this.createTableRow(item, now);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    section.appendChild(tableContainer);

    return section;
  }

  createTableRow(item, now) {
    const tr = document.createElement('tr');
    const itemDate = DateUtils.parseDateString(item.data);

    if (item.compromisso !== null) {
      tr.classList.add('has-event');
    }

    if (DateUtils.isPastDate(itemDate, now)) {
      tr.classList.add('is-past');
    }

    const tdData = document.createElement('td');
    tdData.className = 'data-cell';

    const time = document.createElement('time');
    const [day, month, year] = item.data.split('/');
    time.setAttribute('datetime', `20${year}-${month}-${day}`);
    time.textContent = item.data;
    tdData.appendChild(time);

    const tdDiaSemana = document.createElement('td');
    tdDiaSemana.className = 'dia-semana-cell';
    tdDiaSemana.textContent = item.dia_semana || '';

    const tdCompromisso = document.createElement('td');
    tdCompromisso.textContent = item.compromisso || '';

    tr.appendChild(tdData);
    tr.appendChild(tdDiaSemana);
    tr.appendChild(tdCompromisso);

    return tr;
  }
}

class App {
  constructor() {
    this.ui = new CalendarUI({
      calendar: 'calendar',
      todayDisplay: 'today-display',
      nextEventDisplay: 'next-event-display',
      countdownDisplay: 'countdown-display'
    });
    this.agendaManager = null;
  }

  async init() {
    try {
      const response = await fetch('dados.json');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const agendaData = await response.json();
      this.agendaManager = new AgendaManager(agendaData);

      this.render();
      this.startClock();
    } catch (error) {
      console.error('Erro ao carregar ou processar os dados:', error);
    }
  }

  render() {
    const now = new Date();
    this.ui.renderTodayDate(now);
    this.ui.renderCalendar(this.agendaManager.agendaData, now);
    this.updateDynamicHeader(now);
  }

  updateDynamicHeader(now = new Date()) {
    const nextEventData = this.agendaManager.getNextEvent(now);
    this.ui.renderNextEvent(nextEventData, now);
    this.ui.renderCountdown(now);
  }

  startClock() {
    setInterval(() => {
      this.updateDynamicHeader(new Date());
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});