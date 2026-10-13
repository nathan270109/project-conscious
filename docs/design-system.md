# Conscious Design System

## Direção

O sistema visual do Project Conscious comunica precisão técnica, confiança e clareza. A referência de maturidade é o CodeRabbit: hierarquia editorial forte, superfícies discretas, conteúdo técnico em camadas e uma única ação principal por contexto. A identidade, a paleta e os componentes continuam próprios do Conscious.

## Princípios

1. **Evidência antes de decoração:** score, dimensão, finding e próximo passo devem ser reconhecidos rapidamente.
2. **Uma linguagem em todo o fluxo:** marketing, formulários, estados, dashboard e IA compartilham tokens e componentes.
3. **Contraste com propósito:** laranja indica ação ou prioridade; verde indica sucesso ou contexto confiável; vermelho indica falha.
4. **Densidade progressiva:** a home explica, o formulário coleta, o dashboard aprofunda e o chat contextualiza.
5. **Responsividade estrutural:** layouts mudam de colunas para fluxo vertical sem esconder informação importante.

## Tokens

Os tokens globais ficam em `src/styles.css`.

- Fundo: `--color-bg`, `--color-bg-elevated`.
- Superfícies: `--color-surface`, `--color-surface-strong`.
- Texto: `--color-text`, `--color-text-muted`, `--color-text-subtle`.
- Ação: `--color-accent`, `--color-accent-strong`.
- Estados: `--color-positive`, `--color-warning`, `--color-danger`, `--color-info`.
- Bordas: `--color-border`, `--color-border-strong`.
- Raios: de `--radius-sm` a `--radius-xl`; pills apenas para badges e severidade.
- Conteúdo: `--container: 1200px`.
- Espaçamento vertical: `--section-space`.

## Tipografia

- `Stack Sans Headline` para títulos, scores e números de impacto.
- `Stack Sans Text` para navegação, corpo, formulários e dados.
- Fonte monoespaçada apenas para caminhos, notas compactas e índices técnicos.
- Eyebrows usam caixa alta, tamanho reduzido e tracking amplo.

## Componentes

- **Botão primário:** fundo claro, texto escuro e raio pequeno.
- **Botão secundário:** fundo transparente, borda visível e texto claro.
- **Card:** superfície escura, borda de baixo contraste e pouca ou nenhuma sombra.
- **Badge:** formato pill reservado para estados, severidades e demonstração.
- **Input:** superfície rebaixada, borda forte e focus ring com a cor de ação.
- **Tabela técnica:** cabeçalho compacto, linhas separadas e números alinhados.
- **Chat:** contexto à esquerda em telas amplas e conversa em primeiro plano no mobile.

## Responsividade

- Desktop: duas colunas para conteúdo + produto e cinco colunas para dimensões.
- Tablet: composição reduzida e dimensões em duas colunas.
- Mobile: fluxo único, ações com largura confortável e conteúdo técnico sem overflow horizontal.
- O header troca a navegação completa pelo menu lateral abaixo de 900 px.

## Acessibilidade

- Contraste mínimo compatível com WCAG AA para textos essenciais.
- Estados não dependem apenas de cor: sempre incluem rótulo textual.
- Focus ring global e visível.
- Respeito a `prefers-reduced-motion`.
- Componentes interativos usam elementos semânticos e nomes acessíveis.
