# Fluxo do MVP Crabcare

O paciente deve conseguir registrar como está com poucos toques.

- Login com o estilo verde das outras telas; paciente/1234 para demonstração.
- Uma única escala de dor, na tela inicial, com os seis rostinhos originais. O atalho Dor retorna para essa escala; não abre outro questionário.
- Sintomas: marcar cansaço, enjoo, falta de ar, sonolência, falta de apetite ou febre; ou escolher nenhum outro sintoma. Registro ao tocar.
- Alimentação: escolher “Comi bem”, “Comi pouco” ou “Não consegui comer”. Registro ao tocar.
- Painel compacto com a dor, os sintomas e a alimentação registrados.
- Agenda de medicamentos com horários marcáveis.

Não adicionar selects, pergunta de evolução da dor, perguntas extras de bem-estar, questionários numéricos, rotina ou autocuidado. As escalas clínicas e o pitch enviados são contexto do projeto, não um pedido para obrigar o paciente a responder todos os instrumentos. O ícone de alimentação usa somente talheres, sem prato. Preservar as formas originais de `icones.svg`. Não usar áudios.

Os estados visuais de demonstração usam apenas a escala de dor: muito intensa/pior dor gera o destaque crítico; moderada/intensa gera atenção; sem dor/leve exibe o registro. Não há diagnóstico, prescrição ou encaminhamento clínico automático. O contato com a equipe é simulado. Dados ficam somente nesta sessão.

## Arquivos

- `index.html`: aplicativo com CSS, JS e SVG incorporados.
- `app.js`: componentes, navegação e registros.
- `style.css`: identidade visual, com distribuição via Tailwind Browser 4.3.3 CDN.
- `icones.svg`: rostinhos originais preservados.
- `demonstracao.html`: mesmas telas abertas para visualização.
- `atualizar_previa.py`: após editar os fontes, executar `python3 atualizar_previa.py` dentro de `crabcare` para sincronizar os HTMLs.

Sem npm, servidor ou fontes externas. O CDN do Tailwind precisa de internet. Não executar push automaticamente.
