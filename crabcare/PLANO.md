# Demonstração Crabcare: paciente e equipe clínica

## Rotas independentes

- `/crabcare/pac/`: paciente, com login visual `paciente1` / `1234`.
- `/crabcare/doc/`: equipe clínica, com login visual `medico1` / `1234`.
- `/crabcare/`: encaminha apenas para `/crabcare/pac/`.

Não incluir botão, link, seletor de perfil ou acesso à tela médica na interface do paciente.

## Pacientes de demonstração

`dados-demo.json` define os usuários, seus IDs estáveis, os vínculos com o médico e os relatos iniciais.

- `medico1`: responsável pelos pacientes 1 a 6.
- `paciente1`: nossa sessão interativa; começa sem respostas, exceto quando já existe um relato salvo.
- `paciente2`: dor intensa, febre e enjoo.
- `paciente3`: dor moderada e cansaço.
- `paciente4`: dor muito intensa e falta de ar.
- `paciente5`: dor leve e nenhum outro sintoma.
- `paciente6`: sem dor, com enjoo e falta de apetite.

Todos usam senha visual 1234, definida somente nos campos de login. O JSON não contém senhas. É possível entrar como paciente2, paciente3 etc. para alterar registros separados.

A primeira leitura carrega apenas os pacientes ausentes do armazenamento. Reabrir a página ou regenerar os HTMLs não sobrescreve registros nem ações médicas já salvos. Para acrescentar pacientes, adicionar um ID único ao JSON com o `doctorId` correspondente e executar o gerador. Os novos pacientes serão acrescentados na próxima leitura. Edições em cenários já gravados não reinicializam dados do navegador.

O usuário antigo `paciente` é reconhecido como `paciente1`; o usuário antigo `medico` aponta para `medico1`. Relatos antigos são preservados nessa migração. Outros registros antigos não são removidos.

## Fluxo do paciente

- Uma escala de dor na tela inicial, com os seis rostinhos originais e os sintomas juntos.
- Sintomas: cansaço, enjoo, falta de ar, sonolência, falta de apetite ou febre; ou nenhum outro sintoma.
- Alimentação: comi bem, comi pouco ou não consegui comer.
- Agenda de medicamentos com horários marcáveis.
- Salvar cada alteração automaticamente. Recuperar o último registro do mesmo usuário ao entrar novamente.
- Mostrar o retorno de relato visto pela equipe quando corresponder à versão atual do registro.
- Alerta crítico aparece em um `dialog` modal nativo, à frente da tela, com fundo escurecido e foco no botão Solicitar contato da equipe. Alertas de atenção continuam no cartão.
- O modal permite voltar ao registro para corrigir as escolhas. Escape e o botão de retorno dispensam a abertura automática para a mesma combinação; uma nova combinação crítica pode abrir novamente.
- Solicitar contato grava um pedido próprio do paciente. Enquanto esse pedido estiver pendente para a mesma combinação, o botão mostra Contato solicitado e não duplica pedidos nem reabre o modal automaticamente. A opção Alertas permite reabrir manualmente.

## Fluxo profissional

- Ler os registros dos pacientes no armazenamento compartilhado.
- Listar somente os pacientes vinculados ao médico conectado, com prioridade para alertas críticos; permitir filtrar alertas.
- Entrar como medico1 seleciona paciente1, mantendo os outros pacientes disponíveis na lista.
- Pacientes sem respostas aparecem como aguardando relato, sem contar como relato não visto.
- Mostrar dor, sintomas, alimentação, combinação e última atualização recebidos do paciente.
- Exibir faixa de alerta, resumo, plano de ação e botões de acompanhamento inspirados no slide do projeto.
- Marcar relato como visto e simular chamada da enfermagem. Registrar essas ações localmente.
- Mostrar Contato solicitado na lista e no relato do paciente. A equipe pode marcar o contato realizado na demonstração; o paciente recebe esse retorno via armazenamento compartilhado. Marcar como visto não resolve um pedido de contato.
- Se o paciente atualizar o relato, mostrar novamente como não visto. Impedir ação sobre uma versão antiga sem revisar a atualização.
- Não inventar exames, temperatura, leito, diagnóstico ou iniciar protocolo de antibiótico com dados que não foram fornecidos.

## localStorage

`shared.js` concentra armazenamento, validação dos registros e regras de alerta para ambos os lados. A chave é `crabcare.reports.v1`, com versão 1 e uma lista de registros por ID estável do paciente, com `doctorId` separado. Senhas e campos de login não são armazenados.

As telas atualizam com o evento `storage` e releem os registros ao recuperar foco. O médico também tem Atualizar. Cada registro pode conter `contactRequest`, com a combinação correspondente, horário e estado pending/contacted. Mudar somente a alimentação preserva esse pedido; mudar dor/sintomas invalida a associação anterior. Pedidos e retornos são simulados, sem chamada externa.

A revisão do médico usa a versão de atualização do paciente; uma revisão antiga não marca automaticamente um novo relato como visto.

O compartilhamento exige o mesmo navegador/perfil e a mesma origem (protocolo, domínio e porta). Funciona entre `/pac/` e `/doc/` no mesmo site. Arquivos `file://` separados e prévias isoladas não garantem compartilhamento. Não há sincronização entre navegadores, dispositivos ou usuários remotos. Não instalar servidor ou dependências para esta tarefa.

## Regras de demonstração

- Dor muito intensa/pior dor: crítico.
- Dor intensa + febre ou falta de ar: crítico.
- Febre + falta de ar: crítico.
- Dor moderada/intensa ou outro sintoma, sem combinação crítica: atenção.
- Sem dor/leve sem outros sintomas: registro simples.

São regras visuais do MVP, não protocolo clínico validado. Ações da equipe são simuladas.

## Organização

- `pac/index.html`: fonte da tela do paciente.
- `doc/index.html` e `doc/app.js`: fonte e comportamento da equipe clínica.
- `app.js`: componentes e comportamento do paciente.
- `shared.js`: regras, inicialização dos pacientes e persistência compartilhadas.
- `dados-demo.json`: médico, pacientes, vínculos e cenários iniciais. O gerador incorpora esse JSON nos HTMLs para não depender de fetch ou servidor.
- `style.css`: identidade comum; Tailwind Browser 4.3.3 via CDN.
- `icones.svg`: rostinhos originais preservados.
- `demonstracao.html`: prévia das telas do paciente, sem acesso médico.
- `atualizar_previa.py`: incorpora os fontes em ambos os HTMLs e atualiza a prévia. Rodar `python3 atualizar_previa.py` dentro de `crabcare` após editar os fontes.

Manter os HTMLs autocontidos para visualização. Sem selects, questionários longos, áudios, fontes externas ou prato no ícone de alimentação. A barra inferior fica no rodapé e somente o conteúdo central rola. Fazer push quando solicitado pelo usuário.
