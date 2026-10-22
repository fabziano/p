# Plano de ação do MVP Crabcare

1. Registrar intensidade da dor, evolução e bem-estar usando os rostinhos originais de `icones.svg`.
2. Atualizar o alerta e o plano de ação ao mudar qualquer resposta; o painel começa sem dados clínicos inventados.
3. Organizar distribuição e responsividade com Tailwind Browser 4.3.3 via CDN, sem npm, build ou servidor.
4. Reaproveitar componentes nativos: opções de rostinhos, cabeçalhos, navegação, cartões de medicamento e mensagens de estado. Separar estado e regras dos elementos visuais em `app.js`.
5. Manter login visual paciente/1234, saída pelo nome Crabcare e pela barra inferior, áudio local da escala e prévia com todas as telas.

## Regras da demonstração (ordem de prioridade)

Estas regras organizam a prova de conceito visual; não são um protocolo clínico.

| Condição | Estado | Plano apresentado |
| --- | --- | --- |
| Dor muito intensa ou pior dor possível | Alerta crítico, mesmo com respostas pendentes | Simular chamada da equipe, compartilhar relato e aguardar avaliação |
| Dor intensa + piorando OU dor intensa + “Não estou bem” | Alerta crítico | Mesmo fluxo de contato com a equipe |
| Falta intensidade, evolução ou bem-estar, sem condição crítica | Registro incompleto | Completar as respostas; não exibir conclusão de ausência de alerta |
| Dor moderada/intensa OU piorando OU “Não estou bem” | Atenção | Compartilhar relato e acompanhar evolução |
| Sem dor/dor leve + melhorando/igual + “Estou bem”/“Estou mais ou menos” | Sem alerta nesta combinação | Manter registro e atualizar se houver mudança |

A prioridade crítica prevalece sobre as outras. Um estado crítico pode ser revisto ao mudar as respostas, sempre exibindo o motivo atual. Registrar uma chamada não resolve o alerta. Não há prescrições, diagnósticos, envio de mensagens ou persistência de dados do paciente.

## Arquivos e prévia

- `index.html`: aplicativo e login; CSS, JavaScript e SVG incorporados para abrir o arquivo diretamente.
- `app.js`: componentes nativos, navegação, estado e regras.
- `style.css`: identidade visual e estados compartilhados; Tailwind cuida dos grids, espaçamentos e breakpoints.
- `icones.svg`: fonte original dos rostinhos, preservada.
- `demonstracao.html`: mesmas telas e comportamento, abertas inicialmente; sem respostas predefinidas para não inventar um estado de alerta.
- `atualizar_previa.py`: sincroniza CSS/JS/SVG incorporados e gera a demonstração a partir do `index.html`. Depois de editar os fontes, execute `python3 atualizar_previa.py` dentro de `crabcare`. Não é necessário executar isso para abrir o MVP.

O Tailwind via CDN precisa de acesso à internet. Nenhuma fonte externa ou outra biblioteca é usada. Não executar push automaticamente.
