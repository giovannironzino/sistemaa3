# Sistema de Design — Êxodo Reports

A **Êxodo** produz relatórios executivos de diagnóstico estratégico — documentos editoriais que respondem a uma única pergunta por projeto: *"Como esta empresa funciona hoje?"*. O relatório é analítico, não prescritivo: explica o modelo de negócio atual antes de qualquer recomendação.

Linguagem visual: um híbrido entre **Brutalismo Editorial** e **Laboratório Estratégico** — fundo branco, tipografia preta, um único vermelho (Êxodo Red) reservado estritamente para ênfase, layouts editoriais grandes e assimétricos, alta densidade de informação equilibrada por bastante espaço em branco. Formato: A4, qualidade de impressão, 300dpi.

**Fontes:** este sistema foi construído a partir de um guia de marca em texto e, posteriormente, de uma prancha oficial de identidade visual (`uploads/pasted-1784759216412-0.png` / `pasted-1784759228822-0.png`) enviada pelo usuário — logotipo, paleta, tipografia, ícones e exemplos de página reais foram extraídos dessa prancha. Nenhum Figma ou repositório de código foi anexado.

## Índice

- `styles.css` — folha de estilo raiz, importa tudo abaixo.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`.
- `assets/` — `logo-color.png` / `logo-mono.png` (recortes originais da prancha) e suas versões `-transparent.png` (fundo removido, para uso sobre superfícies coloridas).
- `guidelines/` — cards de fundamentos (Colors, Type, Spacing, Brand) exibidos na aba de Design System.
- `components/core/` — `Button`, `Tag`, `Divider`, `Card`, `CornerAccent`.
- `components/content/` — `PageHeader`, `Callout`, `PullQuote`, `SectionTopic`, `DotGrid`.
- `components/data/` — `StatBlock`, `BarChart`, `DataTable`.
- `components/navigation/` — `SectionNav`, `PageFooter`.
- `ui_kits/report/` — recriação interativa de um relatório Êxodo completo (capa + 4 seções), composta inteiramente pelos componentes acima.
- `thumbnail.html` — miniatura do projeto (logotipo mono sobre preto + faixa de cores).
- `SKILL.md` — wrapper de skill portável para Claude Code.

## Fundamentos de Conteúdo

- **Voz:** de analista, não de vendedor. Frases declarativas, baseadas em evidência. Sem ressalvas de preenchimento ("acreditamos que", "parece que").
- **Ponto de vista:** terceira pessoa sobre a empresa diagnosticada ("A Acme Co. opera como..."), nunca "você" — é um relatório *sobre* uma empresa, não um discurso de venda *para* o leitor.
- **Estrutura:** toda seção abre com uma pergunta, não uma afirmação — a pergunta é o maior elemento tipográfico da página. Exemplo: *"De onde vem o dinheiro, de fato?"*
- **Parágrafos:** curtos e escaneáveis, 1–3 frases. As descobertas são ditas de forma direta, seguidas de uma linha de consequência.
- **Números antes de adjetivos:** preferir um dado ("62% da receita") a uma afirmação qualitativa ("a maior parte da receita").
- **Sem emoji, sem pontos de exclamação, sem superlativos de marketing** ("revolucionário", "destrave").
- **Rótulos de seção são processuais, não criativos:** "Modelo de Receita", "Estrutura de Custos", "Leitura Estratégica" — não jargão inventado.
- **Tom de encerramento:** retém recomendações deliberadamente. Uma seção como "Leitura Estratégica" afirma a implicação da descoberta e para — não prescreve próximos passos.
- **Idioma:** todo o conteúdo é escrito em Português (BR).

## Fundamentos Visuais

- **Cores:** fundo branco (`--branco`), preto quase puro para toda a tipografia (`--preto` `#0D0D0D`), escala de cinzas (`--cinza-escuro` `#333333`, `--cinza-medio` `#666666`, `--cinza-claro` `#E5E5E5`) e um único **Êxodo Red** (`#D71920`) usado apenas para ênfase — uma barra destacada num gráfico, um traço sob uma citação, uma etiqueta. Nunca mais que vermelho + preto/branco numa mesma página.
- **Tipografia:** três famílias, cada uma com um papel definido, exatamente como na prancha de marca. **Anton** para títulos e a grande pergunta de cada página — o maior elemento visual, usado em caixa alta ou mixto. **Montserrat Bold** para subtítulos e destaques — rótulos de seção, dados, números de página, sempre em caixa alta. **Inter** (Regular/Medium) para textos e parágrafos — sempre em sentença, nunca caixa alta.
- **Escala:** o tipo da pergunta é fluido (`clamp(2.75rem…5.75rem)`) e sempre a âncora visual; o corpo de texto nunca fica abaixo de 1rem; rótulos em Montserrat ficam entre 0.7–0.8rem com tracking largo.
- **Espaçamento:** generoso, editorial — a escala vai de 4px a 128px; margens de página padrão de 64px.
- **Layout:** grade assimétrica de 12 colunas, nunca centralizada/simétrica. Toda página de relatório segue o mesmo esqueleto — topo: logotipo + rótulo "Diagnóstico Estratégico de Negócio" + pergunta grande + introdução curta; meio: conteúdo analítico (estatísticas, gráficos, tabelas); rodapé: uma nota de "Leitura Estratégica" ou "Metodologia" com ícone de informação; uma trilha vertical (`SectionNav`) acompanha o progresso pelo relatório.
- **Fundos:** brancos e planos — sem gradientes, sem fotografia, sem ilustração, sem textura/grão. A única variação de superfície permitida é um bloco cinza-claro plano, usado com moderação.
- **Bordas e divisores:** linhas finas de 1px em `--border-default` para estrutura; traço vermelho de 2–3px marca uma quebra forte ou a espinha de uma citação.
- **Raios de canto:** praticamente nenhum. `--radius-sm` (2px) existe só para o Card; o restante é quadrado. Elemento gráfico próprio: quarto de círculo vermelho (`CornerAccent`) como acento geométrico de capa/encerramento.
- **Gráficos:** barras pretas planas sobre trilho cinza-claro, sem grades/eixos/legendas; exatamente uma barra pode ser destacada em vermelho por gráfico.
- **Animação e estados:** sem movimento no relatório em si (é um artefato impresso). Elementos interativos (botões, navegação) usam transições de cor rápidas (~150ms) — sem escala/bounce/blur.
- **Transparência/blur:** nenhum — a estética é plana e deliberada.
- **Elemento de apoio "grade de pontos":** um padrão de pontos cinza (`DotGrid`) usado como preenchimento visual escaneável em áreas de conteúdo, replicando o elemento de apoio da prancha de marca.
- **Imagens:** nenhuma fotografia foi fornecida; o sistema não usa imagens de banco de imagens nem ilustrações decorativas, conforme a diretriz "evitar fotos corporativas de banco de imagens".

## Iconografia e Marcas

- **Logotipo real fornecido pelo usuário** — recortado da prancha de marca em `assets/logo-color.png` (versão vermelha) e `assets/logo-mono.png` (versão monocromática), com variantes de fundo transparente (`-transparent.png`) para uso sobre superfícies escuras ou coloridas.
- **Ícones:** a prancha de marca mostra um conjunto de ícones geométricos de linha fina (alvo, gráfico de barras, prancheta, usuário, calendário, aperto de mãos, atualizar, escudo, estrela, megafone, pessoas, tendência, engrenagem, busca). Como o conjunto não veio como arquivo (SVG/fonte), o sistema linka os equivalentes mais próximos via **Lucide** (CDN), com traço de 1.5–1.6px — mesmo peso visual da prancha. Ver `guidelines/iconography.card.html`.
- **Emoji:** nunca usado.

## Substituição de fontes — sinalização
As fontes **Anton**, **Montserrat** e **Inter** vêm do Google Fonts e correspondem exatamente aos nomes indicados na prancha de marca do usuário ("ANTON", "MONTSERRAT", "Inter") — não são substitutas; foram carregadas via CDN do Google Fonts em `tokens/fonts.css`. Caso a Êxodo possua arquivos de fonte licenciados (para impressão offline/300dpi sem dependência de CDN), envie-os para substituirmos por `@font-face` local.

## Adições intencionais
Como a prancha de marca definiu paleta, tipografia, ícones e elementos de apoio, mas não um inventário formal de componentes de UI, o conjunto de primitivos abaixo foi autorado a partir desses elementos de apoio e dos exemplos de página reais: `Button`, `Tag`, `Divider`, `Card`, `CornerAccent` (core); `PageHeader`, `Callout`, `PullQuote`, `SectionTopic`, `DotGrid` (content); `StatBlock`, `BarChart`, `DataTable` (data); `SectionNav`, `PageFooter` (navigation).
