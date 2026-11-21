# Livy — ficha de personagem

Narradora da série de vídeos curtos verticais (TikTok/Reels). Tudo aqui é **fixo**: só o rosto muda de um episódio para o outro.

## 1. Visual
- **Nome / idade:** Livy, 10 anos (5º ano).
- **Rosto e cabelo:** **idênticos à imagem de referência** (base em `base/livy-base-recorte.png`): chanel curto prateado (`#E9E9E9`, sombra `#D3D3D3`), franja longa com mecha central, olhos grandes âmbar/laranja com brilho branco, blush em três traços, nariz de ponto e sorriso com dentes.
- **Pele:** `#FFDEB8`. **Sombra sob o queixo:** `#BEA589`.
- **Roupa fixa (única parte roxa):** moletom **roxo escuro** (`#3A2578`, detalhes `#24124F`) com cordões brancos.
- **Marca registrada:** **fone de ouvido** creme (`#F4EEE2`) com detalhe verde-menta (`#3DE0C2`), sempre apoiado nos ombros.
- **Expressões:** o rosto original é mantido; cada emoção só acrescenta pálpebra, sobrancelha, lágrima ou boca por cima, no mesmo traço.

## 2. Personalidade
Curiosa demais, observadora, teimosa, honesta (não sabe mentir), exagera um pouquinho nas histórias. Tem medo de coisa boba (barata, escuro) e coragem para o que importa. Conta as histórias da família olhando para a câmera, como quem fala com a melhor amiga.

## 3. Jeito de falar
- Rápido e empolgado, frases curtas, gíria leve de criança (“tipo”, “juro”, “pera aí”, “não é possível”).
- **Sempre abre com um gancho:** “Gente, vocês não vão acreditar no que meu avô fez hoje.”
- Pausa dramática: “…e aí.” Sussurra segredo, fica aguda quando indignada.
- Imita a voz dos adultos.
- Fecha com uma moral inocente: “Moral da história: nunca confie num pai com uma chave de fenda.”
- **Bordões:** “Prestem atenção, que agora fica bom.” · “Spoiler: deu errado.” · “Eu juro que é verdade.”
- **Voz (se usar narração por IA):** criança de 9–11 anos, ritmo ágil, entonação expressiva.

## 4. Expressões (`avatares/1-livy/`)
| Arquivo | Quando usar |
|---|---|
| `livy-feliz` | a parte boa, o final feliz |
| `livy-triste` | o desfecho injusto, o castigo |
| `livy-surpreso` | a virada, o “não é possível” |
| `livy-confuso` | quando o adulto explica algo sem sentido |
| `livy-bravo` | quando ninguém acredita nela |

## 5. Elenco de apoio (`avatares/2-elenco/`)
| Arquivo | Personagem | Resumo | Voz |
|---|---|---|---|
| `pai` | Renato, 38 | mão na massa, piada ruim, confiança demais | grave e caloroso |
| `mae` | Carol, 36 | sabe de tudo, paciente até contar até três | firme e carinhosa |
| `avo` | Vô Tonho, 71 | contador de causos, cúmplice da Livy | rouco e devagar |
| `irma` | Duda, 24 | implica, mas defende a Livy | rápida e sarcástica |
| `professora` | Profa. Helena, 40 | adora perguntas (até a 47ª) | clara e didática |
| `vizinho` | Seu Jorge, 45 | resmungão só na aparência | resmungado |
| `seguranca` | Seu Tião, 50 | leva o trabalho a sério demais | formal e firme |

Cada um tem as 5 expressões em `avatares/2-elenco/expressoes/`. Todos são desenhados a partir do mesmo rosto da Livy (mesmos olhos, traço e blush), com cor de pele, cabelo e olhos próprios, cabelo mais curto ou mais longo e acessórios (óculos, barba, boné, coque, rabo de cavalo). Nomes e idades são sugestões: dá para trocar sem mexer no desenho. A mãe, a Livy e a irmã compartilham os olhos âmbar (traço de família).

## 6. Prompt-mestre (para gerar imagens/vídeo mantendo o personagem)
> Livy, 10-year-old girl, 2D anime style, thin black outlines, flat cel shading, large amber-orange gradient eyes with two white highlights, light pink hatched blush, tiny dot nose, wide friendly smile, short silver-white layered bob with long pointed bangs and glossy white hair highlights, dark-purple hoodie with white drawstrings, cream headphones with mint-green accents resting on her shoulders, front-facing bust, transparent background.

## 7. Regras de consistência
1. Nunca mudar cabelo prateado, moletom roxo ou fone, nem o formato dos olhos.
2. Contorno sempre preto e grosso; sombras chapadas, sem degradê (exceto a íris).
3. Reaproveitar os arquivos em `avatares/`: PNG 1024×1280 com fundo transparente para editar no CapCut/Premiere, SVG para qualquer tamanho.
4. Novos personagens: adicionar uma receita em `gerador/variantes.py` (cores e corte de cabelo) e em `gerador/ref_cast.js` (acessórios e roupa); todos partem do mesmo rosto da Livy.

## Arquivos
- `folhas/01-ficha-livy.png`, `02-livy-expressoes.png`, `03-elenco.png`: folhas de apresentação.
- `gerador/`: código que gera tudo. Ordem: `python3 gerador/recorte_ref.py <referência> base/livy-base-recorte.png`, `python3 gerador/variantes.py`, `node gerador/build_all.js` (precisa de Node, Playwright, Python com Pillow, NumPy e SciPy).

## Aviso sobre a imagem de referência
A imagem de referência vem de um banco de imagens e traz a marca d'água "pngtree", que continua visível nos arquivos da Livy. Para uso em publicações, use a versão licenciada (sem marca d'água): coloque o arquivo e rode `python3 gerador/recorte_ref.py <imagem> base/livy-base-recorte.png` e depois `node gerador/build_all.js`.
