const scholarForm = document.getElementById('scholar-form');

const FIELD_CONFIGS = [
    { id: 'as_q', format: val => val },
    { id: 'as_epq', format: val => `"${val}"` },
    { id: 'as_oq', format: val => `(${val.split(/\s+/).join(' OR ')})` },
    { id: 'as_eq', format: val => val.split(/\s+/).map(w => `-${w}`).join(' ') },
    { id: 'as_sauthors', format: val => val.split(/\s+/).map(a => `author:"${a}"`).join(' ') }
];

function buildScholarQuery() {
    const isTitleOnly = document.querySelector('input[name="as_occt"]:checked')?.value === 'title';
    
    const queryParts = FIELD_CONFIGS
        .map(({ id, format }) => {
            const val = document.getElementById(id).value.trim();
            return val ? format(val) : '';
        })
        .filter(Boolean);

    const fullQuery = queryParts.join(' ');
    return isTitleOnly && fullQuery ? `allintitle: ${fullQuery}` : fullQuery;
}

scholarForm.addEventListener('submit', () => {
    document.getElementById('scholar-final-query').value = buildScholarQuery();

    ['as_ylo', 'as_yhi'].forEach(id => {
        const input = document.getElementById(id);
        input.disabled = !input.value.trim();
        setTimeout(() => { input.disabled = false; }, 500);
    });
});