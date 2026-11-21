# Livy — ficha de personagem

Narradora da série de vídeos curtos verticais (TikTok/Reels). Tudo aqui é **fixo**: só o rosto muda de um episódio para o outro.

## 1. Visual
- **Nome / idade:** Livy, 10 anos (5º ano).
- **Estilo:** anime 2D, contorno preto grosso, sombra chapada (cel), olhos grandes com brilho branco, blush em três traços, nariz de ponto. Mesma linguagem da referência.
- **Cabelo:** chanel curto **roxo escuro** (`#4D2C93`, sombra `#2D1760`), franja repicada com ponta central longa, brilhos lilás (`#B8A2F5`) em arco no topo.
- **Olhos:** grandes, âmbar/laranja com degradê (`#B4420B` → `#FF9B1D` → `#FFE24D`), dois brilhos brancos.
- **Pele:** clara (`#FBDCB4`), blush `#EE8B8B`.
- **Roupa fixa:** moletom **roxo escuro** (`#33205F`) com cordões brancos.
- **Marca registrada:** **fone de ouvido** creme (`#F4EEE2`) com detalhe verde-menta (`#3DE0C2`), sempre apoiado nos ombros.
- **Contorno:** `#15101D`, 5 px num quadro de 512×640.

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
| `livy-sorriso`, `livy-neutro` | extras para narração calma |

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

Cada um tem as 5 expressões em `avatares/2-elenco/expressoes/`. Nomes e idades são sugestões: dá para trocar sem mexer no desenho. A mãe, a Livy e a irmã compartilham os olhos âmbar (traço de família).

## 6. Prompt-mestre (para gerar imagens/vídeo mantendo o personagem)
> Livy, 10-year-old girl, 2D anime style, thick black outlines, flat cel shading, large amber-orange gradient eyes with two white highlights, light pink hatched blush, tiny dot nose, short dark-purple bob with jagged bangs and lavender hair shines, dark-purple hoodie with white drawstrings, cream headphones with mint-green accents resting on her shoulders, front-facing bust, transparent background.

## 7. Regras de consistência
1. Nunca mudar cabelo, moletom ou fone, nem o formato dos olhos.
2. Contorno sempre preto e grosso; sombras chapadas, sem degradê (exceto a íris).
3. Reaproveitar os arquivos em `avatares/`: PNG 1024×1280 com fundo transparente para editar no CapCut/Premiere, SVG para qualquer tamanho.
4. Novos personagens: criar no gerador (`gerador/personagens.js`), que já aplica o mesmo rosto, olhos, blush e contorno.

## Arquivos
- `folhas/01-ficha-livy.png`, `02-livy-expressoes.png`, `03-elenco.png`: folhas de apresentação.
- `gerador/`: código que gera tudo (`cd gerador && node build_all.js`; precisa de Node e Playwright).
