# Guia de Imagens e Banners — Loja Nuvemshop

Este arquivo documenta onde está cada imagem e vídeo nos templates da loja (`page.tpl` e `product.tpl`).

> As imagens da loja ficam na pasta `images/` do tema Nuvemshop e são referenciadas via `{{ 'images/nome-do-arquivo.png' | static_url }}`.

---

## Sumário

1. [page.tpl — Página "Sobre Nós"](#1-pagetpl--página-sobre-nós)
2. [product.tpl — Página de Produto](#2-producttpl--página-de-produto)

---

## 1. page.tpl — Página "Sobre Nós"

Este template tem dois layouts:
- **`Sobre Nós`** → layout especial com banners e vídeo
- **Qualquer outra página** → layout padrão só com texto

O layout especial só aparece quando `page.name == 'Sobre Nós'`. Se o nome da página na loja mudar, o layout volta ao padrão.

---

### Vídeo — YouTube embed

| O que é | URL atual | Onde trocar |
|---|---|---|
| Vídeo embed do YouTube | `https://www.youtube.com/embed/uoe6vSVUX_A` | Atributo `src` do `<iframe>` |

**Como trocar:** Pegue o ID do novo vídeo no YouTube (a parte após `watch?v=`) e substitua na URL: `https://www.youtube.com/embed/SEU_ID_AQUI`.

---

### Banner 1 — faixa horizontal (16:9)

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-sobre-nos-01.png` | 1570 × 520 px | `/colecao-1` |

**Como trocar a imagem:** Faça upload do novo arquivo no painel Nuvemshop em **Personalizar tema → Arquivos** com o nome `banner-sobre-nos-01.png`.

**Como trocar o link:** Edite o atributo `href` da tag `<a class="banner-fw banner-1">`.

---

### Banner 2 — faixa horizontal (16:9)

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-sobre-nos-02.png` | 1570 × 520 px | `/colecao-2` |

**Como trocar a imagem:** Upload com o nome `banner-sobre-nos-02.png`.

**Como trocar o link:** Edite o atributo `href` da tag `<a class="banner-fw banner-2">`.

---

### Banner 3 — quadrado

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-sobre-nos-03.png` | 800 × 800 px (1:1) | `/colecao-3` |

**Como trocar a imagem:** Upload com o nome `banner-sobre-nos-03.png`.

**Como trocar o link:** Edite o atributo `href` da tag `<a>` do primeiro `col-6`.

---

### Banner 4 — quadrado

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-sobre-nos-04.png` | 800 × 800 px (1:1) | `/colecao-4` |

**Como trocar a imagem:** Upload com o nome `banner-sobre-nos-04.png`.

**Como trocar o link:** Edite o atributo `href` da tag `<a>` do segundo `col-6`.

---

### Texto da página

O texto principal da página **não está no código** — ele vem do campo `{{ page.content }}`, que é editado direto no painel da Nuvemshop em **Conteúdo → Páginas → Sobre Nós**.

---

## 2. product.tpl — Página de Produto

Abaixo das informações do produto (foto + formulário), aparecem um vídeo e 3 banners empilhados em tela cheia.

---

### Vídeo — YouTube embed

| O que é | URL atual | Onde trocar |
|---|---|---|
| Vídeo embed do YouTube | `https://www.youtube.com/embed/uoe6vSVUX_A` | Atributo `src` do `<iframe>` dentro de `.product-video-wrapper` |

**Como trocar:** Substitua o ID do vídeo na URL do `src` do `<iframe>`.

> Este é o mesmo vídeo do "Sobre Nós". Se quiser vídeos diferentes por página, use URLs distintas em cada template.

---

### Banner 1 — faixa horizontal

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-produto-01.png` | 1570 × 520 px | `/colecao-1` |

**Como trocar a imagem:** Upload com o nome `banner-produto-01.png`.

**Como trocar o link:** Edite o `href` da tag `<a class="banner-fw banner-1">`.

---

### Banner 2 — faixa horizontal

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-produto-03.png` | 1570 × 520 px | `/colecao-2` |

> Atenção: o arquivo se chama `banner-produto-03.png` mas ocupa a posição de Banner 2 no layout.

**Como trocar a imagem:** Upload com o nome `banner-produto-03.png`.

**Como trocar o link:** Edite o `href` da tag `<a class="banner-fw banner-2">`.

---

### Banner 3 — faixa horizontal

| Arquivo | Dimensões recomendadas | Link de destino |
|---|---|---|
| `images/banner-produto-02.png` | 1570 × 520 px | `/colecao-3` |

> Atenção: o arquivo se chama `banner-produto-02.png` mas ocupa a posição de Banner 3 no layout.

**Como trocar a imagem:** Upload com o nome `banner-produto-02.png`.

**Como trocar o link:** Edite o `href` da tag `<a class="banner-fw banner-3">`.

---

## Resumo rápido — todos os arquivos

| Arquivo | Template | Posição |
|---|---|---|
| `images/banner-sobre-nos-01.png` | page.tpl | Sobre Nós — Banner faixa 1 |
| `images/banner-sobre-nos-02.png` | page.tpl | Sobre Nós — Banner faixa 2 |
| `images/banner-sobre-nos-03.png` | page.tpl | Sobre Nós — Banner quadrado esquerdo |
| `images/banner-sobre-nos-04.png` | page.tpl | Sobre Nós — Banner quadrado direito |
| `images/banner-produto-01.png` | product.tpl | Produto — Banner faixa 1 |
| `images/banner-produto-03.png` | product.tpl | Produto — Banner faixa 2 (nome fora de ordem) |
| `images/banner-produto-02.png` | product.tpl | Produto — Banner faixa 3 (nome fora de ordem) |

---

## Observação — ordem dos banners de produto

Os arquivos `banner-produto-02.png` e `banner-produto-03.png` estão com a numeração trocada no código:

```
Posição visual 2 → usa o arquivo banner-produto-03.png
Posição visual 3 → usa o arquivo banner-produto-02.png
```

Se quiser corrigir, basta renomear os arquivos no painel da Nuvemshop e atualizar os `src` correspondentes no `product.tpl`.
