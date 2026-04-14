# Guia de Imagens — sections.html

> Todas as imagens ficam em: `https://felipetruthcommerce.github.io/sopy-main/assets/images/`
> Os vídeos ficam no **Cloudflare R2** (URLs `pub-*.r2.dev`)

---

## Como trocar qualquer imagem

1. Faça upload da nova imagem no GitHub Pages (`assets/images/`)
2. Abra o `sections.html`
3. Use **Ctrl+F** para buscar o nome do arquivo atual (coluna "Arquivo" abaixo)
4. Troque a URL pela nova

---

## Mapa de todas as imagens

| Seção | O que é | Arquivo atual | Tem variante por tema? |
|---|---|---|---|
| **Hero** | Poster do vídeo (aparece enquanto carrega) | `video-capa.jpg` | Não |
| **Hero** | Vídeo desktop | URL no Cloudflare R2 — ver `sections.html` linha 26 | Não |
| **Hero** | Vídeo mobile | URLs no `script.js` linhas 51–52 | Não |
| **Cápsula 3D** | Imagem da cápsula girando | `capsula_azul_small.webp` / `capsula_verde_small.webp` | Sim — editar no `script.js` ~linha 1096 |
| **3D — Card BAG** | Foto da bolsa pequena | `bag_aqua1.webp` / `bag_citrus.webp` | Sim — `data-aqua` e `data-citrus` |
| **3D — Card BOX** | Foto da caixa grande | `box_aqua.webp` / `box_citrus.webp` | Sim — `data-aqua` e `data-citrus` |
| **Sustentabilidade 1** | "Mais praticidade" | `mais-praticidade-01.webp` / `mais-praticidade-01-citrus.webp` | Sim — `src`, `data-aqua`, `data-citrus` |
| **Sustentabilidade 2** | "Melhores Resultados" | `melhores-resultados-01.webp` / `melhores-resultados-01-citrus.webp` | Sim — `src`, `data-aqua`, `data-citrus` |
| **Sustentabilidade 3** | "Fragrâncias" | `perfume-aqua-01.webp` / `perfume-citrus-01.jpg` | Sim — Citrus trocado pelo `script.js` ~linha 921 |
| **Sustentabilidade 4** | "Menos plástico" | `menos-plastico-01.webp` / `menos-plastico-01-aqua.webp` / `menos-plastico-01-citrus.webp` | Sim — `src`, `data-aqua`, `data-citrus` |
| **Slider slide 1** | "Selecione o ciclo" | `Como_usar_4.jpg` | Não |
| **Slider slide 2** | "Como usar" | `slide-01-aqua.webp` / `slide-01-citrus.webp` | Sim — `style`, `data-aqua`, `data-citrus` |
| **Slider slide 3** | "Jogue a cápsula" | `slide-02-aqua.webp` / `slide-02-citrus.webp` | Sim — `style`, `data-aqua`, `data-citrus` |
| **Slider slide 4** | "Coloque as roupas" | `Como_usar_03.jpg` | Não |
| **Comparativo — Sopy** | Foto do produto Sopy | `sabao-sopy.webp` / `sabao-sopy-azul.webp` | Sim — `src`, `data-aqua`, `data-citrus` |
| **Comparativo — Tradicional** | Foto sabão em pó/líquido | `banner_comparativo_modelos_tradicionais.webp` | Não |
| **Toggle flutuante** | Cápsula verde (Citrus) | `capsula-verde.webp` | Não |
| **Toggle flutuante** | Cápsula azul (Aqua) | `capsula-azul.webp` | Não |

---

## Imagens com variante por tema — como funciona

Algumas imagens mudam automaticamente quando o visitante usa o toggle Aqua/Citrus. Elas têm dois atributos no HTML:

```html
<img
  src="imagem-padrao.webp"       ← exibida por padrão (tema Aqua)
  data-aqua="imagem-aqua.webp"   ← tema Aqua (azul)
  data-citrus="imagem-citrus.webp" ← tema Citrus (verde)
/>
```

Para trocar: edite os três atributos (`src`, `data-aqua`, `data-citrus`).

---

## Vídeos — onde trocar

| Dispositivo | Onde fica | Como trocar |
|---|---|---|
| Desktop (≥ 900px) | `sections.html` — atributo `src` da `<source>` | Suba o vídeo no Cloudflare R2 e troque a URL |
| Mobile Android | `script.js` linha 51 — constante `WEBM_URL` | Troque a URL direto na constante |
| Mobile iOS | `script.js` linha 52 — constante `MP4_URL` | Troque a URL direto na constante |
