# Integração das Bolhas 3D - Documentação

## ✅ O QUE FOI FEITO

### 1. SCRIPT.JS - Função `initCapsuleBubbles()` Adicionada
**Localização:** Linha ~318 (antes de `initThree()`)

**Funcionalidades Implementadas:**
- ✅ Criação de cena Three.js separada para as bolhas
- ✅ Sistema de iluminação com HDRI (Venice Sunset)
- ✅ 10 bolhas flutuantes com movimento de subida
- ✅ Oscilação lateral natural (sine wave)
- ✅ Materiais físicos realistas (MeshPhysicalMaterial)
- ✅ Sistema de raycasting para detecção de cliques
- ✅ Explosão de partículas ao clicar nas bolhas
- ✅ Sistema de partículas com fade-out e cores
- ✅ Respawn automático de bolhas após explosão
- ✅ Responsividade (resize automático)

### 2. SCRIPT.JS - Inicialização Automática
**Localização:** Linha ~1787 (dentro do IntersectionObserver)

**Lógica de Carregamento:**
```javascript
const threeSection = document.getElementById("capsula-3d");
if (threeSection) {
    new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {
            initThree();
            // Inicializar bolhas 3D junto com a cena principal
            if (typeof THREE !== 'undefined') {
                initCapsuleBubbles();
            }
            observer.unobserve(threeSection);
        }
    }, { threshold: 0.1 }).observe(threeSection);
}
```

**Características:**
- ✅ Carregamento lazy (só quando a seção entra no viewport)
- ✅ Evita inicialização múltipla com flag `__bubblesInitialized`
- ✅ Verifica disponibilidade do THREE.js antes de iniciar
- ✅ Otimizado para performance (threshold 0.1)

### 3. SECTIONS.HTML - Estrutura HTML
**Localização:** Linha 61 (dentro da seção `#capsula-3d`)

**HTML Existente (NÃO FOI MODIFICADO):**
```html
<!-- decorative bubbles container: created by JS -->
<div class="sopy-capsule-bubbles" aria-hidden="true"></div>
```

**Características:**
- ✅ Container já existia no HTML
- ✅ Posicionamento correto dentro da seção 3D
- ✅ Atributo `aria-hidden="true"` para acessibilidade
- ✅ Classe `.sopy-capsule-bubbles` para seleção JavaScript

## 🎯 COMO FUNCIONA

### Fluxo de Execução:
1. **Página carrega** → IntersectionObserver monitora seção `#capsula-3d`
2. **Seção entra no viewport** → `initThree()` e `initCapsuleBubbles()` são chamados
3. **Bolhas são criadas** → 10 bolhas com posições e velocidades aleatórias
4. **HDRI carrega** → Venice Sunset para reflexos realistas (ou fallback)
5. **Loop de animação inicia** → Bolhas sobem e oscilam lateralmente
6. **Usuário clica em bolha** → Explosão de 30 partículas + respawn da bolha

### Sistema de Partículas:
- **30 partículas** por explosão
- **Velocidades aleatórias** em todas as direções
- **Fade-out gradual** baseado na vida útil (0.8-1.5s)
- **Cores dinâmicas** (transição de branco para azul claro)
- **Remoção automática** quando todas as partículas morrem

### Física das Bolhas:
- **Movimento vertical:** Velocidade aleatória (0.05 - 0.15 unidades/frame)
- **Oscilação horizontal:** Amplitude 1-4 unidades, Frequência 0.5-1.5 Hz
- **Respawn:** Quando Y > 25, bolha retorna para Y = -25
- **Tamanho:** Escala aleatória entre 0.4 e 2.0

## 🎨 ADAPTAÇÕES PARA NUVEMSHOP

### Padrões Seguidos:
✅ **Lazy Loading:** Igual a todas as outras animações Three.js do projeto
✅ **IntersectionObserver:** Mesma estratégia de `initThree()`
✅ **Flag de Inicialização:** `__bubblesInitialized` previne múltiplas inicializações
✅ **Console Logs:** Mesmo padrão de logging (`[BUBBLES]`)
✅ **Estrutura de Código:** Declaração de função + chamada condicional
✅ **Fallback de HDRI:** Continua funcionando sem environment map
✅ **Responsividade:** Event listener de resize igual ao código existente

### Diferenças do Código Original:
- ❌ **REMOVIDO:** `document.addEventListener('DOMContentLoaded', ...)` no final
- ✅ **ADICIONADO:** Chamada dentro do IntersectionObserver existente
- ✅ **MANTIDO:** Toda a lógica de física, partículas e interação
- ✅ **MANTIDO:** Sistema de HDRI com fallback robusto

## 📋 CHECKLIST DE VERIFICAÇÃO

### Para o Usuário Testar:
- [ ] Abrir a página e scrollar até a seção 3D
- [ ] Verificar se as bolhas aparecem e sobem
- [ ] Clicar em uma bolha e verificar a explosão de partículas
- [ ] Verificar se uma nova bolha aparece após 500ms
- [ ] Redimensionar a janela e verificar responsividade
- [ ] Testar em mobile (touch deve funcionar)
- [ ] Verificar console para mensagens `[BUBBLES]`

### Comportamentos Esperados:
✅ Bolhas aparecem quando a seção entra no viewport
✅ Bolhas sobem lentamente com oscilação lateral
✅ Clicar em bolha gera explosão de partículas brancas/azuis
✅ Partículas fazem fade-out e desaparecem gradualmente
✅ Nova bolha é criada 500ms após destruição
✅ Canvas se redimensiona automaticamente com a janela
✅ Funciona em desktop e mobile

## 🐛 TROUBLESHOOTING

### Se as bolhas não aparecerem:
1. Verificar console: deve ter `[BUBBLES] Inicializando bolhas 3D...`
2. Verificar se THREE.js está carregado: `typeof THREE` no console
3. Verificar se RGBELoader existe: `typeof THREE.RGBELoader`
4. Verificar se container existe: `document.querySelector('.sopy-capsule-bubbles')`

### Se HDRI não carregar:
- **Comportamento:** Bolhas ficam mais opacas (opacity: 0.35)
- **Mensagem:** `[BUBBLES] Falha ao carregar HDRI. Prosseguindo sem environment map.`
- **Solução:** Normal, sistema continua funcionando com fallback

### Se partículas não aparecerem:
- Verificar se `createExplosion()` é chamada ao clicar
- Verificar se raycaster está detectando colisões
- Verificar se canvas está acima de outros elementos (z-index)

## 📝 NOTAS IMPORTANTES

1. **Performance:** Sistema otimizado com delta time para consistência em diferentes FPS
2. **Memory Management:** Partículas são removidas automaticamente da cena
3. **Z-Index:** Canvas das bolhas está em layer separado do canvas principal
4. **Interação:** Click/touch funciona porque canvas tem listeners próprios
5. **Acessibilidade:** Container marcado como `aria-hidden="true"`

## 🎓 CÓDIGO MODULAR

A função `initCapsuleBubbles()` é completamente independente de `initThree()`:
- **Cena separada** (não interfere com a cápsula principal)
- **Renderer separado** (canvas próprio)
- **Camera separada** (perspectiva independente)
- **Loop de animação próprio** (requestAnimationFrame isolado)

Isso significa que você pode:
- ✅ Desabilitar as bolhas sem afetar a cápsula 3D
- ✅ Modificar parâmetros das bolhas sem riscos
- ✅ Adicionar mais efeitos no futuro
- ✅ Remover a funcionalidade facilmente se necessário

---

**Data da Integração:** 2025-10-15
**Arquivos Modificados:** `script.js` (adição de função + chamada)
**Arquivos Não Modificados:** `sections.html` (container já existia)
