# Fluxo do MVP Crabcare

- Login visual paciente/1234, com a identidade verde das outras telas. Sem os três atalhos de cuidados e sem textos descritivos adicionais.
- O início é o acompanhamento: seis rostinhos originais da escala de dor e seleção curta de sintomas juntos no mesmo cartão.
- Marcar cansaço, enjoo, falta de ar, sonolência, falta de apetite ou febre; ou nenhum outro sintoma.
- O alerta aparece na própria tela inicial, logo abaixo das escolhas. Não existe aba Meu painel nem página separada de sintomas ou escala de dor.
- O alerta segue a composição visual do slide: faixa de estado, resumo do paciente, dor e sintomas associados, plano de ação e botões. Mostrar apenas as escolhas reais da sessão; não inventar exames, temperatura, leito ou diagnóstico.
- Alimentação tem três opções: comi bem, comi pouco ou não consegui comer.
- Agenda de medicamentos com horários marcáveis.
- Barra inferior sempre no rodapé; somente o conteúdo central rola dentro da tela. Mensagens de retorno ficam acima da barra. A prévia com várias telas também mantém a navegação no rodapé.

## Combinações visuais da demonstração

| Escolhas | Destaque |
| --- | --- |
| Dor muito intensa ou pior dor possível | Crítico |
| Dor intensa + febre ou falta de ar | Crítico |
| Febre + falta de ar | Crítico |
| Dor moderada/intensa ou qualquer sintoma associado, sem condição crítica | Atenção |
| Sem dor/leve e sem outro sintoma | Registro simples, sem cartão de alerta |
| Nada informado | Aguardando escolhas |

Recalcular ao mudar as escolhas, mostrando a combinação que originou o destaque. O contato com a equipe é simulado e não resolve automaticamente o estado do relato. Essas regras são somente do MVP, não um protocolo clínico validado. Dados somente na sessão.

Não adicionar selects, perguntas de evolução de dor ou bem-estar, questionários numéricos, rotina ou autocuidado. As escalas clínicas e o pitch são contexto, não um pedido para obrigar o paciente a responder todos os instrumentos. Ícone de alimentação só com talheres, sem prato. Preservar `icones.svg`. Não usar áudios.

## Arquivos

- `index.html`: aplicativo com CSS, JS e SVG incorporados.
- `app.js`: componentes, navegação, registros e combinações do alerta.
- `style.css`: identidade visual e Tailwind Browser 4.3.3 CDN para distribuição.
- `icones.svg`: rostinhos originais preservados.
- `demonstracao.html`: início, alimentação e medicamentos abertos para visualização.
- `atualizar_previa.py`: executar `python3 atualizar_previa.py` dentro de `crabcare` após alterar os fontes para sincronizar os HTMLs.

Sem npm, servidor ou fontes externas. O CDN do Tailwind precisa de internet. Não executar push automaticamente.
