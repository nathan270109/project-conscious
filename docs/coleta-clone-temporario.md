# Coleta por clone temporário

## Fluxo

Link público → cadastro com UUID da API → scanning → clone raso da branch padrão
→ leitura dos objetos Git → motor de cinco dimensões → limpeza → dashboard.

Não há chamadas à API REST do GitHub nem uso de GITHUB_TOKEN neste fluxo. Ainda
dependemos de internet, disponibilidade do GitHub e suas políticas de tráfego Git.
Privados/inexistentes não são distinguíveis de forma confiável sem autorização:
ambos retornam a mensagem segura de repositório público não encontrado.

## Pasta e segurança

- Requisito do servidor: Git atualizado e disponível no PATH. Ambiente suportado
  para esta entrega: execução local validada em macOS; Linux e Windows têm
  implementação adaptada e workflow de validação nativa, ainda a executar.
  Veja [Inicialização por sistema](inicializacao.md).
- Iniciar com `cd backend` e `npm run start:dev`. O armazenamento é `.analysis-tmp`
  no diretório de execução; em produção, definir um diretório de trabalho dedicado
  e gravável para o backend, fora das pastas servidas publicamente.
- Cada chamada cria sua própria pasta aleatória via `mkdtemp`. Não usamos nome,
  URL ou ID fornecido pelo usuário como caminho de remoção.
- Clone bare com depth 1, single branch, sem tags, checkout, submódulos ou templates.
  O bare guarda o código em objetos Git, não em arquivos de trabalho instalados.
  README/HTML/JS/TS são lidos diretamente desses objetos e enviados ao motor.
- Git roda sem shell, prompts, credential helpers, configuração global/sistema
  ou hooks. Só HTTPS é permitido e redirects HTTP são bloqueados. URLs são
  reconstruídas a partir de owner/repo validados no host github.com.
  Cabeçalho Authorization é suprimido e cookies locais não são usados.
- Symlinks não são seguidos; submódulos não são analisados. Não executamos npm,
  scripts, builds, testes do visitante, filtros de checkout ou código baixado.
- Dependências e artefatos são excluídos: node_modules, vendor, dist, build,
  coverage e .git. São exclusões da análise, não um clone esparso: arquivos dessas
  pastas ainda podem participar do download.
- O `finally` remove apenas a pasta criada nesta chamada, depois de o motor
  terminar, mesmo quando ele lança um erro. Falha de limpeza não é escondida
  como sucesso. O resultado, não o clone, segue para o frontend.

## Limites iniciais

| Recurso | Limite |
| --- | --- |
| Análises simultâneas por instância | 2; a terceira recebe falha segura, sem fila |
| Coleta Git | 45 segundos, abaixo dos 60 segundos de espera do frontend |
| Download em disco | 100 MiB, monitorado a cada 250 ms e verificado após clone |
| Entradas da árvore | 10.000 |
| Arquivos relevantes | 2.000 |
| Conteúdo de cada arquivo relevante | 1 MiB |
| Conteúdo relevante total | 20 MiB |
| Saída de cada comando Git | 4 MiB, incluindo stderr |

Exceder os limites interrompe a coleta: não devolvemos uma análise parcial como
concluída. A API de análise preserva FAILED/ANALYSIS_FAILED com HTTP 500; privado
ou inexistente preserva FAILED/REPOSITORY_NOT_FOUND com HTTP 404. A leitura direta
de arquivos pode devolver 400/413/503 em vez de AnalysisResult.

O limite de disco é monitorado, não uma quota rígida do sistema de arquivos:
um download rápido pode ultrapassá-lo entre medições. Produção requer quota de
volume/container. O prazo interrompe processos Git; não limita rigidamente um
analisador síncrono já em execução. Os limites de entrada reduzem esse risco.

## Validação antes do stand

1. Instalar/atualizar Git no computador servidor e conferir `git --version`.
2. Iniciar backend em `backend` e frontend na raiz. Manter ambos abertos.
3. Colar um link público pequeno e confirmar resultado real com demoMode false.
4. Confirmar que `.analysis-tmp` não contém pastas scan após a resposta.
5. Testar URL inexistente; confirmar FAILED e a limpeza da cópia parcial.
6. Ensaiar um repositório representativo do público e avaliar limites/duração.
7. Manter o demo salvo como opção explícita em caso de falta de internet. Nunca
   apresentar a demonstração salva como análise ao vivo de um link diferente.

## Pendências de produção

- Recuperação de pastas órfãs: finally não roda se o servidor receber SIGKILL,
  perder energia ou cair. Nesse caso, reiniciar não remove órfãos automaticamente.
  Implantar limpeza por retenção com controle de operações ativas; nunca apagar
  indiscriminadamente diretórios do projeto. Não há garantia de descarte seguro
  de bytes em SSD; a remoção é lógica do sistema de arquivos.
- Quota rígida de disco, isolamento do worker, limitação por cliente e autenticação
  da aplicação para prevenir abuso. Concorrência 2 vale por processo, não globalmente.
- Executar o workflow de compatibilidade em Windows/Linux antes de anunciar
  suporte comprovado nesses ambientes. A adaptação foi implementada, mas o teste
  local em macOS não substitui execução nativa.
- Cache persistente foi deixado fora: conflitaria com a decisão de apagar a cópia.

## Evidência da implementação — 07/10/2026

Executada uma análise real pelo ProjectsModule e ProjectAnalysisService, sem mock
de coleta, do repositório público `katherinykamili/project-conscious-demo`.
Resultado: COMPLETED, demoMode false, score 74, cinco dimensões e dez findings.
Coleta + motor em aproximadamente 1 segundo; `.analysis-tmp` vazia após a resposta.
Isso é evidência de análise real do código do projeto de demonstração, não leitura
do JSON salvo. Não substitui o ensaio completo no navegador do computador do stand.

Validação automatizada: suítes completas do backend e frontend, builds, lint do
backend e git diff --check. Testes incluem limpeza em sucesso/erro do motor/clone,
isolamento de diretórios, limites de bytes/arquivos, timeout, exclusões, concorrência
e bloqueio de protocolos locais. O npm reportou seis alertas de dependências no
backend após a remoção de Octokit; não aplicamos npm audit fix --force nesta entrega.

### Ensaio no navegador — 07/10/2026

Executado com frontend de teste na porta 4205 e backend atualizado na porta 3001.
Os servidores do usuário em 4200/3000 foram preservados. A instância antiga em
3000 ainda devolvia a mensagem da coleta REST e precisa ser reiniciada para
carregar esta implementação; compilar não atualiza um processo Node já iniciado.

| Cenário no navegador | Resultado observado |
| --- | --- |
| Cadastro → scanning → dashboard, project-conscious-demo | Score 74, cinco dimensões, dez findings; sem selo de demonstração salva |
| Mesmo fluxo, nathan270109/project-conscious | Score 81, cinco dimensões; resultado do código público da branch padrão do GitHub |
| Repositório inexistente | Mensagem de repositório público não encontrado; link de retorno funcionando |
| URL fora do GitHub | Formulário rejeitou a entrada e permaneceu no cadastro |
| Demonstração salva, seguida de recarga | Score 74 e identificação explícita de análise salva preservados |
| Resultado real após perder a sessão/recarga | Mensagem de análise não encontrada e retorno ao formulário, conforme contrato sem persistência |
| Nova análise após perder a sessão | Funcionou novamente, com score 81 |

Conferida `.analysis-tmp` vazia após sucesso, falha e ao final do ensaio. Foram
apagadas somente as cópias temporárias criadas pelo coletor; os repositórios
originais e o checkout de desenvolvimento não foram removidos.

Reexecução: 177 testes unitários do backend, 34 E2E do backend e 85 testes do
frontend passando; builds de ambos, lint do backend e git diff --check passando.
Timeout, limites e falhas de limpeza foram testados automaticamente, não forçados
na interface com repositórios gigantes. Não foram acessados repositórios privados
reais. Este ensaio não garante disponibilidade do GitHub ou internet no stand.

Observação independente da coleta: heurísticas atuais apontam TODO/log em fixtures
de testes e extensão/linhas de README como manutenção. O score 81 é resultado das
regras atuais, não uma certificação de qualidade. Revisar esses falsos positivos
em entrega separada, sem misturar ajustes de pontuação nesta mudança de coleta.

Referência: [git clone](https://git-scm.com/docs/git-clone).
