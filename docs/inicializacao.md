# Abrir o Project Conscious sem decorar comandos

## Uma vez por computador

Instale [Node.js](https://nodejs.org/en/download) com npm (recomendado Node 24 LTS,
24.15 ou mais recente) e [Git](https://git-scm.com/downloads). No Windows, use
[Git for Windows](https://gitforwindows.org/) com Git disponível no PATH.
Também são compatíveis Node 22.22.3+ e 26+. Não é necessário administrador,
token do GitHub ou PowerShell com política de execução alterada para iniciar.
Use um checkout local confiável; não execute estes scripts de uma origem desconhecida.

## Qual arquivo clicar

| Sistema | Arquivo na raiz | Como abrir |
| --- | --- | --- |
| macOS | `iniciar-macos.command` | Duplo clique no Finder; abre o Terminal |
| Linux | `iniciar-linux.sh` | Escolha “Executar no terminal” no gerenciador de arquivos |
| Windows | `iniciar-windows.cmd` | Duplo clique no Explorador de Arquivos |

Os arquivos macOS/Linux são executáveis no repositório. ZIPs/cópias podem perder
essa permissão. Nesse caso, uma vez: `chmod +x iniciar-macos.command iniciar-linux.sh`.
Alguns gerenciadores Linux abrem `.sh` em um editor por padrão, não em um terminal;
isso depende do desktop e não pode ser imposto pelo conteúdo do script. Alternativa:
`bash iniciar-linux.sh`. No macOS, alternativas de execução no terminal podem
exigir carregar o gerenciador de Node (nvm/asdf) no PATH da sessão: o inicializador
informa se não encontrar npm, sem modificar suas configurações pessoais.
No Windows, caminhos com espaços são tratados com aspas e `pushd`.

## O que ele faz automaticamente

1. Confere versões de Node, npm e Git.
2. Se faltarem as dependências do Angular/Nest, instala usando `npm ci` e os locks
   do projeto. A primeira abertura pode demorar e precisa de internet. Não aplica
   `npm audit fix`, não instala Node/Git e não apaga arquivos de código.
3. Compila o backend atual para não usar uma versão antiga de `dist`.
4. Escolhe portas livres, começando em 3000 e 4200. Não mata processos existentes.
5. Inicia o backend e o Angular, gera um proxy temporário próprio e espera respostas
   HTTP reais antes de anunciar que estão prontos. O proxy mantém as rotas de projeto
   no backend local e encaminha `/api/ai/**` para a implantação AWS do Conscious AI.
6. Mostra os dois links separados. Copie/clique no link FRONTEND para abrir o cadastro.
7. Guarda logs e proxy em `.conscious-runtime/session-*`, ignorada pelo Git.

Os links podem variar conforme as portas ocupadas: use sempre os exibidos na janela.
O proxy versionado do projeto não é alterado. Ambos os serviços iniciados pelo
inicializador ficam vinculados a 127.0.0.1 (loopback), sem publicação na rede local.
Este script não configura publicação na internet, firewall ou servidor de produção.
O chat requer internet porque o modelo Gemma 4 E2B é executado no Amazon Bedrock.
Para testar outra implantação, defina `CONSCIOUS_AI_TARGET` com a origem HTTPS antes
de iniciar; sem essa variável, o inicializador usa a implantação AWS oficial do projeto.

```text
+--------------------------------------------------+
|                  TUDO PRONTO!                    |
+--------------------------------------------------+

  FRONTEND - abra no navegador
  http://127.0.0.1:4200/projects/new

  BACKEND - API
  http://127.0.0.1:3000

  Encerrar: tecla Q ou Ctrl+C nesta janela.
```

Mantenha a janela aberta durante a demonstração. Para fechar, use **Q** ou
**Ctrl+C**, aguardando a mensagem de encerramento, em vez de fechar a janela
à força. Somente processos iniciados nessa sessão são encerrados.
Os logs permanecem disponíveis para diagnóstico; não contêm o código clonado
por este inicializador. Não publique logs sem verificar dados do ambiente.

O backend lançado pelo script tem canal IPC privado de desligamento: tenta
cancelar coletas e limpar as pastas antes de sair. No Windows, se necessário,
`taskkill /PID <pid> /T /F` encerra o processo criado e seus filhos; nunca usamos
`taskkill /IM node.exe`, que afetaria outros projetos. No Unix, usamos o grupo
próprio de processos. Queda de energia, fechamento forçado e SIGKILL ainda podem
deixar pastas de clone órfãs; não há garantia de limpeza nessas situações.

## Testes e diagnóstico

- `npm run conscious:start -- --check`: verifica pré-requisitos, sem instalar ou subir nada.
- `npm run conscious:start -- --smoke`: sobe ambos, cadastra e analisa o repositório
  público de demonstração por clone, confere a limpeza e encerra os serviços.
  Requer internet e não usa o JSON demonstrativo salvo.
- `npm run test:launcher`: testa seleção de porta, versão Node e argumentos seguros
  de encerramento Windows, sem abrir servidores da aplicação.
- Sem rede: a análise de novos links públicos falha; o demo salvo continua sendo
  uma alternativa explícita. Privados continuam fora do escopo sem autorização.
- Se uma dependência já instalada estiver quebrada/incompatível com o sistema,
  veja o log e reinstale com `npm ci` na raiz e em `backend`. Não copie node_modules
  de macOS para Windows/Linux. Não alteramos automaticamente uma instalação existente.
- Resultado real continua apenas na sessão Angular: recarregar o dashboard exige
  nova análise. Isso é independente do sistema operacional e do inicializador.

## Compatibilidade e fontes

O coletor adapta dispositivo nulo (`NUL` no Windows, `/dev/null` no Unix), elimina
dependência de `/usr/bin/false`, desliga prompts/helpers/hooks/configurações pessoais,
usa argumentos sem shell e encerra a árvore Git antes da limpeza. No Windows,
`git.exe` é executado diretamente. O launcher executa npm por `node npm-cli.js`
e Angular por Node, evitando executar `.cmd` com `spawn` sem shell.

- [Node: diferenças de subprocessos entre Unix e Windows](https://nodejs.org/api/child_process.html).
- [Microsoft: taskkill e encerramento dos processos filhos](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill).
- [Git: variáveis de ambiente/configuração](https://git-scm.com/docs/git).
- [Microsoft: políticas PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies/): usamos `.cmd`, sem `ExecutionPolicy Bypass`.

Teste local realizado em macOS. Testes de opções Windows/Linux são simulados no
macOS; isso não equivale a executar nesses sistemas. O workflow
`.github/workflows/compatibilidade.yml` configura testes nativos em macOS, Linux e
Windows, incluindo o ensaio completo. Só haverá evidência desses runners após
publicar a branch e o workflow executar; não foi publicado por este trabalho.

### Evidência local — 11/10/2026

- 182 testes unitários e 34 E2E do backend, 85 testes do frontend e três testes
  do inicializador passando; builds, lint do backend e diff checks passando.
- Arquivos macOS e Linux executados em modo `--check` no macOS. O segundo teste
  valida o script Bash, não uma execução nativa Linux.
- Inicializador completo ensaiado: backend/frontend responderam, cadastro via
  proxy e análise real retornaram score 74 e o clone foi removido.
- Tecla Q testada em terminal interativo: ambos os serviços foram encerrados.
- Nenhum commit, push ou execução externa do workflow foi feito neste trabalho.
