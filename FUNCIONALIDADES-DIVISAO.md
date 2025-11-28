# SOPY LANDING PAGE - DIVISÃO MODULAR DAS FUNCIONALIDADES

## 📋 Resumo das Funcionalidades Identificadas

### 🔧 MÓDULOS INDEPENDENTES (podem ser separados completamente)

#### FUNCIONALIDADE 4: Botões Ripple

- **Responsabilidade**: Efeito visual de ondulação nos botões
- **Dependências**: Apenas DOM
- **Arquivos**: `setupButtonRipples()` function
- **Divisão**: ✅ PODE SER MÓDULO SEPARADO

#### FUNCIONALIDADE 5: Animações de Texto (Estilo Osmo)

- **Responsabilidade**: Split text e animações de entrada para títulos/parágrafos
- **Dependências**: GSAP, ScrollTrigger, SplitText/SplitType
- **Arquivos**: Todo o bloco window.addEventListener('load')
- **Divisão**: ✅ PODE SER MÓDULO SEPARADO
- **Nota**: Exclui elementos #hero e #faq para preservar interatividade

#### FUNCIONALIDADE 7: Bolhas Interativas 3D

- **Responsabilidade**: Bolhas flutuantes com física, explosões de partículas, HDRI lighting
- **Dependências**: Three.js, RGBELoader (opcional)
- **Arquivos**: `initCapsuleBubbles()` function completa
- **Divisão**: ✅ PODE SER MÓDULO SEPARADO
- **Inclui**: Raycasting, particle systems, realistic materials

#### FUNCIONALIDADE 9: Ações de Compra

- **Responsabilidade**: Handlers para botões de compra, integração e-commerce
- **Dependências**: GSAP (feedback visual), DOM
- **Arquivos**: Event listeners para `[data-action="sopy-buy"]`
- **Divisão**: ✅ PODE SER MÓDULO SEPARADO
- **Nota**: Atualmente placeholder, pronto para integração Nuvemshop

---

### ⚙️ MÓDULOS CORE (necessários juntos)

#### FUNCIONALIDADE 1: GSAP Setup & Inicialização

- **Responsabilidade**: Configuração segura GSAP, plugins, custom eases
- **Dependências**: GSAP, ScrollTrigger, CustomEase, SplitText
- **Arquivos**: `registerGSAPOnce()` function
- **Divisão**: ❌ BASE PARA OUTRAS FUNCIONALIDADES

#### FUNCIONALIDADE 3: Lenis Scroll Suave

- **Responsabilidade**: Scroll suave e integração GSAP ticker
- **Dependências**: Lenis.js, GSAP
- **Arquivos**: Configuração do `lenis` object e listeners
- **Divisão**: ⚠️ PARCIAL - core para animações de scroll

---

### 🔗 MÓDULOS RELACIONADOS (compartilham recursos)

#### FUNCIONALIDADE 6 + 8: Cápsula 3D + Toggle Temas

- **FUNCIONALIDADE 6**: Renderização 3D, modelos GLB, animação scroll
- **FUNCIONALIDADE 8**: Troca temas Aqua/Citrus, materiais 3D, conteúdo
- **Dependências Compartilhadas**: Three.js, GSAP, materiais 3D (gelA, gelB, gelC)
- **Divisão**: ⚠️ PARCIAL - dependem uma da outra para materiais

---

### 🛠️ UTILITÁRIOS

#### FUNCIONALIDADE 2: Utils Globais

- **Responsabilidade**: Funções utilitárias (clamp, etc.)
- **Dependências**: Nenhuma
- **Divisão**: ✅ PODE SER SEPARADO

#### FUNCIONALIDADE 10: Inicialização Final

- **Responsabilidade**: Configurações padrão, tema inicial, logs
- **Dependências**: DOM
- **Divisão**: ⚠️ CONFIGURAÇÃO - necessária para funcionamento

---

## 🗂️ Estratégia de Divisão Recomendada

### Arquivo Principal (`main.js`)

```javascript
// CORE - sempre necessário
FUNCIONALIDADE 1: GSAP Setup
FUNCIONALIDADE 3: Lenis Scroll
FUNCIONALIDADE 10: Inicialização Final
```

### Módulos Opcionais

```javascript
// modules/button-ripples.js
FUNCIONALIDADE 4: Botões Ripple

// modules/text-animations.js
FUNCIONALIDADE 5: Animações de Texto

// modules/3d-bubbles.js
FUNCIONALIDADE 7: Bolhas 3D

// modules/ecommerce.js
FUNCIONALIDADE 9: Ações de Compra

// modules/utils.js
FUNCIONALIDADE 2: Utils Globais
```

### Módulo Combinado (devido à interdependência)

```javascript
// modules/3d-themes.js
FUNCIONALIDADE 6: Cápsula 3D Principal
FUNCIONALIDADE 8: Toggle de Temas
```

---

## ⚡ Benefícios da Modularização

1. **Performance**: Carregamento condicional baseado na página
2. **Manutenção**: Código organizado por funcionalidade
3. **Reutilização**: Módulos podem ser usados em outros projetos
4. **Debug**: Fácil isolamento de problemas
5. **Colaboração**: Desenvolvedores podem trabalhar em módulos específicos

---

## 🔄 Dependências Entre Módulos

```
GSAP Setup (1) ← Todas as animações dependem
    ↓
Lenis (3) ← ScrollTrigger animations dependem
    ↓
Text Animations (5), 3D+Themes (6+8)

Button Ripples (4) ← Independente
Bubbles 3D (7) ← Independente
E-commerce (9) ← Independente
```
