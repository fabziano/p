fetch('icones.svg')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const externalSvg = parser.parseFromString(data, 'image/svg+xml');
        
        document.querySelectorAll('[data-icon]').forEach(targetSvg => {
            const iconId = targetSvg.getAttribute('data-icon');
            const sourceGroup = externalSvg.getElementById(iconId);
            const defs = externalSvg.querySelector('defs');

            if (sourceGroup) {
                if (defs && !targetSvg.querySelector('defs')) {
                    targetSvg.appendChild(defs.cloneNode(true));
                }
                targetSvg.appendChild(sourceGroup.cloneNode(true));
            }
        });
    })
.catch(err => console.error('Erro ao carregar o SVG externo:', err));