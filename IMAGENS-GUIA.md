# Guia de Imagens e Banners — sections.html

Este arquivo documenta **onde está cada imagem e banner** no código do site, com o número exato da linha para facilitar a troca.

> As imagens estão hospedadas no **GitHub Pages**: `https://felipetruthcommerce.github.io/sopy-main/assets/images/`
> Os **vídeos da Hero** estão hospedados no **Cloudflare R2** (CDN externo, URLs com `pub-*.r2.dev`).

---

## Sumário de seções

1. [Hero — Vídeo de fundo](#1-hero--vídeo-de-fundo)
2. [Seção 3D — Card BAG (bolsa)](#2-seção-3d--card-bag-bolsa)
3. [Seção 3D — Card BOX (caixa)](#3-seção-3d--card-box-caixa)
4. [Sustentabilidade — Mais praticidade](#4-sustentabilidade--mais-praticidade)
5. [Sustentabilidade — Melhores resultados](#5-sustentabilidade--melhores-resultados)
6. [Sustentabilidade — Fragrâncias](#6-sustentabilidade--fragrâncias)
7. [Sustentabilidade — Menos plástico](#7-sustentabilidade--menos-plástico)
8. [Slider "Como usar" — 4 slides](#8-slider-como-usar--4-slides)
9. [Comparativo Sopy x Sabão tradicional](#9-comparativo-sopy-x-sabão-tradicional)
10. [Depoimentos — Avatares](#10-depoimentos--avatares)
11. [Toggle flutuante — Cápsulas](#11-toggle-flutuante--cápsulas)

---

## 1. Hero — Vídeo de fundo

**Seção:** `#hero` | **Linhas: 24–38**

Esta seção exibe um **vídeo em tela cheia hospedado no Cloudflare R2** (CDN externo). Existem versões separadas para desktop e mobile. Há também uma imagem de poster exibida enquanto o vídeo carrega.

### Vídeos (Cloudflare R2)

| Dispositivo | Formato | URL para trocar | Linha |
|---|---|---|---|
| Desktop (≥ 900px) | WebM | `https://pub-26b5fe2727ef4e25bd29a1b60598e331.r2.dev/WhatsApp%20Video%202026-02-05%20at%2014.50.37.webm` | **26** |
| Mobile (≤ 899px) | WebM (Android) | `https://pub-6ab98439333c4b3da88cdddb52f2acf4.r2.dev/video_demonstrativo_vertical_site_low.webm` | **29** |
| Mobile (≤ 899px) | MP4 (iOS Safari) | `https://pub-4009096f9b234998870e8b50e237f762.r2.dev/video_demonstrativo_vertical_site_low.mp4` | **32** |
| Fallback universal | MP4 | `https://pub-4009096f9b234998870e8b50e237f762.r2.dev/video_demonstrativo_vertical_site_low.mp4` | **35** |

> Para trocar o vídeo: faça upload do novo arquivo no Cloudflare R2, copie a URL pública gerada e substitua nos `src=` das `<source>` nas linhas acima. Lembre de manter os formatos corretos (WebM para desktop/Android, MP4 para iOS).

### Poster / imagem de capa

| Onde aparece | Arquivo | Linha |
|---|---|---|
| Poster do vídeo (`poster=` na tag `<video>`) | `assets/images/video-capa.jpg` | **24** |
| Imagem de fallback sobreposta (`<img class="sopy-hero-poster">`) | `assets/images/video-capa.jpg` | **38** |

**Como trocar o poster:** Substitua o `poster=` na linha 24 e o `src=` da `<img>` na linha 38 pela URL da nova imagem.

---

## 2. Seção 3D — Card BAG (bolsa)

**Seção:** `#capsula-3d` — primeiro card de produto | **Linhas: 80–83**

Imagem do produto **BAG** que aparece junto ao objeto 3D após o scroll. Muda conforme o tema selecionado (toggle azul/verde).

| Tema | Arquivo | Onde fica no código |
|---|---|---|
| Aqua (azul) | `assets/images/bag_aqua1.png` | `data-aqua="..."` linha **82** |
| Citrus (verde) | `assets/images/bag_citrus.png` | `data-citrus="..."` linha **81** |

**Como trocar:** Edite os atributos `data-aqua` e `data-citrus` da `<img class="cta-overlay">` nas linhas 81–82.

---

## 3. Seção 3D — Card BOX (caixa)

**Seção:** `#capsula-3d` — segundo card de produto | **Linhas: 98–101**

Imagem do produto **BOX** que aparece no lado oposto ao BAG. Também muda com o tema.

| Tema | Arquivo | Onde fica no código |
|---|---|---|
| Aqua (azul) | `assets/images/box_aqua.png` | `data-aqua="..."` linha **100** |
| Citrus (verde) | `assets/images/box_citrus.png` | `data-citrus="..."` linha **99** |

**Como trocar:** Edite os atributos `data-aqua` e `data-citrus` da `<img class="cta-overlay">` nas linhas 99–100.

---

## 4. Sustentabilidade — Mais praticidade

**Seção:** `.sustainability-parallax` — painel 1 (imagem à esquerda) | **Linha: 129**

Banner lateral exibido no painel de texto "Mais praticidade".

| Tema | Arquivo | Onde fica no código |
|---|---|---|
| Aqua (padrão) | `assets/images/mais-praticidade-01.png` | `src=` e `data-aqua=` linha **129** |
| Citrus | `assets/images/mais-praticidade-01-citrus.png` | `data-citrus=` linha **129** |

**Como trocar:** Edite os atributos `src`, `data-aqua` e `data-citrus` da `<img>` na linha 129.

---

## 5. Sustentabilidade — Melhores resultados

**Seção:** `.sustainability-parallax` — painel 2 (imagem à direita) | **Linha: 150**

Banner lateral exibido no painel "Melhores resultados".

| Tema | Arquivo | Onde fica no código |
|---|---|---|
| Aqua (padrão) | `assets/images/melhores-resultados-01.png` | `src=` e `data-aqua=` linha **150** |
| Citrus | `assets/images/melhores-resultados-01-citrus.png` | `data-citrus=` linha **150** |

**Como trocar:** Edite os atributos `src`, `data-aqua` e `data-citrus` da `<img>` na linha 150.

---

## 6. Sustentabilidade — Fragrâncias

**Seção:** `.sustainability-parallax` — painel 3 (imagem à esquerda) | **Linha: 170**

Banner lateral exibido no painel "Fragrâncias da alta perfumaria". **Não possui variante por tema** (uma única imagem fixa).

| Arquivo | Onde fica no código |
|---|---|
| `assets/images/perfume-aqua-01.png` | `src=` linha **170** |

**Como trocar:** Edite o atributo `src` da `<img>` na linha 170. Se quiser adicionar variante Citrus, inclua também `data-citrus=` seguindo o mesmo padrão dos outros painéis.

---

## 7. Sustentabilidade — Menos plástico

**Seção:** `.sustainability-parallax` — painel 4 (imagem à direita) | **Linha: 203**

Banner lateral exibido no painel "Menos plástico".

| Tema | Arquivo | Onde fica no código |
|---|---|---|
| Aqua | `assets/images/menos-plastico-01-aqua.png` | `data-aqua=` linha **203** |
| Citrus | `assets/images/menos-plastico-01-citrus.png` | `data-citrus=` linha **203** |

> Atenção: o atributo `src=` padrão usa o arquivo sem sufixo `-aqua`. Certifique-se de atualizar `src`, `data-aqua` e `data-citrus` ao trocar.

**Como trocar:** Edite os atributos `src`, `data-aqua` e `data-citrus` da `<img>` na linha 203.

---

## 8. Slider "Como usar" — 4 slides

**Seção:** `#como-usar` | **Linhas: 225–255**

Cada slide é um `<div class="slider-item">` com fundo definido via `style="background-image:url(...)"`. Alguns slides têm variantes por tema.

### Slide 1 — "Selecione o ciclo"
**Linha: 225** — Sem variante por tema.

| Arquivo | Onde fica no código |
|---|---|
| `assets/images/Como_usar_4.jpg` | `style="background-image:url(...)"` linha **225** |

---

### Slide 2 — "Como usar / Três passos simples"
**Linha: 233** — Possui variante por tema.

| Versão | Arquivo | Onde fica no código |
|---|---|---|
| Padrão | `assets/images/slide1.jpeg` | `style="background-image:url(...)"` linha **233** |
| Aqua | `assets/images/slide-01-aqua.png` | `data-aqua=` linha **233** |
| Citrus | `assets/images/slide-01-citrus.png` | `data-citrus=` linha **233** |

---

### Slide 3 — "Jogue a cápsula no tambor vazio"
**Linha: 241** — Possui variante por tema.

| Versão | Arquivo | Onde fica no código |
|---|---|---|
| Padrão | `assets/images/slide2.jpeg` | `style="background-image:url(...)"` linha **241** |
| Aqua | `assets/images/slide-02-aqua.png` | `data-aqua=` linha **241** |
| Citrus | `assets/images/slide-02-citrus.png` | `data-citrus=` linha **241** |

---

### Slide 4 — "Coloque as roupas no tambor"
**Linha: 249** — Sem variante por tema.

| Arquivo | Onde fica no código |
|---|---|
| `assets/images/Como_usar_03.jpg` | `style="background-image:url(...)"` linha **249** |

**Como trocar qualquer slide:** Localize a linha correspondente e substitua a URL dentro de `style="background-image:url('...')"` e/ou nos atributos `data-aqua` / `data-citrus`.

---

## 9. Comparativo Sopy x Sabão tradicional

**Seção:** `#clean-slate-section` | **Linhas: 276–291**

Dois cards lado a lado: um para as cápsulas Sopy e outro para o sabão tradicional.

### Card esquerdo — Cápsulas Sopy
**Linhas: 276–280**

| Tema | Arquivo | Onde fica no código |
|---|---|---|
| Aqua (azul) | `assets/images/sabao-sopy-azul.png` | `data-aqua=` linha **279** |
| Citrus (verde) | `assets/images/sabao-sopy.jpg` | `data-citrus=` e `src=` linha **277–278** |

---

### Card direito — Sabão em Pó & Líquido
**Linha: 291** — Imagem fixa, sem variante por tema.

| Arquivo | Onde fica no código |
|---|---|
| `assets/images/banner_comparativo_modelos_tradicionais.jpg` | `src=` linha **291** |

**Como trocar:** Edite o `src=` da `<img>` na linha 291.

---

## 10. Depoimentos — Avatares

**Seção:** `#testemunhos` | **Linhas: 325, 341, 356**

Fotos de perfil dos clientes nos cards de depoimento. Atualmente usam imagens externas do serviço `randomuser.me`. Para usar fotos reais de clientes, substitua pelas URLs das fotos desejadas.

| Cliente | Arquivo atual | Linha |
|---|---|---|
| Marina A. | `https://randomuser.me/api/portraits/women/44.jpg` | **325** |
| Rafael P. | `https://randomuser.me/api/portraits/men/32.jpg` | **341** |
| Bia L. | `https://randomuser.me/api/portraits/women/68.jpg` | **356** |

**Como trocar:** Edite o atributo `src=` de cada `<img class="tc-avatar">` nas linhas indicadas.

---

## 11. Toggle flutuante — Cápsulas

**Elemento:** `.product-toggle-container` (fixo na tela) | **Linhas: 479–480**

Botão flutuante que permite alternar entre os temas Aqua e Citrus. Exibe as imagens das duas cápsulas.

| Cápsula | Arquivo | Linha |
|---|---|---|
| Verde (Citrus) | `assets/images/capsula-verde.png` | **479** |
| Azul (Aqua) | `assets/images/capsula-azul.png` | **480** |

**Como trocar:** Edite o `src=` de cada `<img class="pod-image">` nas linhas 479 e 480.

---

## Resumo rápido — todas as imagens por arquivo

| Arquivo | Seção | Linha(s) |
|---|---|---|
| `video-capa.jpg` | Hero (poster do vídeo) | 24, 38 |
| `bag_aqua1.png` | 3D Card BAG — tema Aqua | 82 |
| `bag_citrus.png` | 3D Card BAG — tema Citrus | 81 |
| `box_aqua.png` | 3D Card BOX — tema Aqua | 100 |
| `box_citrus.png` | 3D Card BOX — tema Citrus | 99 |
| `mais-praticidade-01.png` | Sustentabilidade painel 1 — Aqua | 129 |
| `mais-praticidade-01-citrus.png` | Sustentabilidade painel 1 — Citrus | 129 |
| `melhores-resultados-01.png` | Sustentabilidade painel 2 — Aqua | 150 |
| `melhores-resultados-01-citrus.png` | Sustentabilidade painel 2 — Citrus | 150 |
| `perfume-aqua-01.png` | Sustentabilidade painel 3 — Fragrâncias | 170 |
| `menos-plastico-01-aqua.png` | Sustentabilidade painel 4 — Aqua | 203 |
| `menos-plastico-01-citrus.png` | Sustentabilidade painel 4 — Citrus | 203 |
| `Como_usar_4.jpg` | Slider slide 1 — fundo | 225 |
| `slide1.jpeg` | Slider slide 2 — fundo padrão | 233 |
| `slide-01-aqua.png` | Slider slide 2 — tema Aqua | 233 |
| `slide-01-citrus.png` | Slider slide 2 — tema Citrus | 233 |
| `slide2.jpeg` | Slider slide 3 — fundo padrão | 241 |
| `slide-02-aqua.png` | Slider slide 3 — tema Aqua | 241 |
| `slide-02-citrus.png` | Slider slide 3 — tema Citrus | 241 |
| `Como_usar_03.jpg` | Slider slide 4 — fundo | 249 |
| `sabao-sopy.jpg` | Comparativo — card Sopy (Citrus) | 277 |
| `sabao-sopy-azul.png` | Comparativo — card Sopy (Aqua) | 279 |
| `banner_comparativo_modelos_tradicionais.jpg` | Comparativo — card Sabão tradicional | 291 |
| `capsula-verde.png` | Toggle flutuante — cápsula Citrus | 479 |
| `capsula-azul.png` | Toggle flutuante — cápsula Aqua | 480 |
