// default.js
const navButtons = document.querySelectorAll('.nav-btn');
const scholarSection = document.getElementById('scholar-section');
const standardSection = document.getElementById('standard-section');
const platformTitle = document.getElementById('platform-title');
const standardForm = document.getElementById('standard-form');
const searchInput = document.getElementById('search-input');
const hiddenInputs = document.getElementById('hidden-inputs');

const PLATFORMS = {
    scielo: { name: 'SciELO', action: 'https://search.scielo.org/', param: 'q' },
    arxiv: { name: 'arXiv', action: 'https://arxiv.org/search/', param: 'query' },
    ieee: { name: 'IEEE Xplore', action: 'https://ieeexplore.ieee.org/search/searchresult.jsp', param: 'newsearch' },
    annas: { name: "Anna's Archive", action: 'https://annas-archive.org/search', param: 'q' },
    oamg: { name: 'OA.mg', action: 'https://oa.mg/search', param: 'q' },
    consensus: { name: 'Consensus', action: 'https://consensus.app/results/', param: 'q' },
    connectedpapers: { name: 'Connected Papers', action: 'https://www.connectedpapers.com/search', param: 'q' }
};

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-value');

        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (target === 'scholar') {
            scholarSection.classList.remove('d-none');
            standardSection.classList.add('d-none');
        } else {
            scholarSection.classList.add('d-none');
            standardSection.classList.remove('d-none');

            const config = PLATFORMS[target];
            if (config) {
                platformTitle.textContent = config.name;
                standardForm.action = config.action;
                searchInput.name = config.param;
            }
        }
    });
});