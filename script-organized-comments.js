/* ===================================================
   SOPY LANDING PAGE - SCRIPT ORGANIZADO POR FUNCIONALIDADES
   
   RESUMO DE FUNCIONALIDADES PARA DIVISÃO MODULAR:
   
   MÓDULOS INDEPENDENTES (podem ser separados):
   - FUNCIONALIDADE 4: Botões Ripple
   - FUNCIONALIDADE 5: Animações de Texto
   - FUNCIONALIDADE 7: Bolhas 3D
   - FUNCIONALIDADE 9: Ações de Compra
   
   MÓDULOS CORE (necessários juntos):
   - FUNCIONALIDADE 1: GSAP Setup (base para tudo)
   - FUNCIONALIDADE 3: Lenis (base para scroll)
   
   MÓDULOS RELACIONADOS:
   - FUNCIONALIDADE 6 + 8: Cápsula 3D + Toggle Temas (compartilham materiais)
   
   UTILITÁRIOS:
   - FUNCIONALIDADE 2: Utils globais
   - FUNCIONALIDADE 10: Inicialização
   ==================================================== */

/* ===================================================
   FUNCIONALIDADE 1: GSAP SETUP & INICIALIZAÇÃO
   Responsável por: Configuração segura do GSAP, plugins e custom eases
   Dependências: GSAP, ScrollTrigger, CustomEase, SplitText (via CDN)
   Módulo independente: NÃO - base para outras funcionalidades
   ==================================================== */
function registerGSAPOnce() {
  if (!window.gsap || window.__gsapPluginsRegistered) return;
  const plugs = [];
  if (typeof ScrollTrigger !== "undefined") plugs.push(ScrollTrigger);
  if (typeof CustomEase !== "undefined")   plugs.push(CustomEase);
  if (typeof SplitText !== "undefined")    plugs.push(SplitText);
  if (plugs.length && typeof gsap.registerPlugin === 'function') gsap.registerPlugin(...plugs);

  // Crie as eases uma única vez
  if (typeof CustomEase !== "undefined") {
    if (!CustomEase.get("hop"))       CustomEase.create("hop",       "0.9,0,0.1,1");
    if (!CustomEase.get("osmo-ease")) CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
  }

  window.__gsapPluginsRegistered = true;
}
window.addEventListener('load', registerGSAPOnce);

/* ===================================================
   FUNCIONALIDADE 2: UTILITIES GLOBAIS
   Responsável por: Funções utilitárias compartilhadas
   Dependências: Nenhuma
   Módulo independente: SIM - pode ser separado
   ==================================================== */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ===================================================
   FUNCIONALIDADE 3: LENIS SCROLL SUAVE
   Responsável por: Configuração do scroll suave e integração com GSAP
   Dependências: Lenis.js, GSAP ScrollTrigger
   Módulo independente: PARCIAL - core para outras animações de scroll
   ==================================================== */
const lenis = new Lenis()
// Atualiza o ScrollTrigger via Lenis se o plugin estiver disponível
if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger && typeof ScrollTrigger.update === 'function') {
  lenis.on('scroll', ScrollTrigger.update);
} else {
  // fallback seguro: registra um listener vazio para manter a API coerente
  lenis.on('scroll', () => {});
}
gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// Configuração do GSAP
gsap.ticker.lagSmoothing(0);

// Observer para atualizar o Lenis quando necessário
const resizeObserver = new ResizeObserver(() => {
  lenis.resize();
});
resizeObserver.observe(document.body);

// Sempre iniciar no topo ao recarregar
try {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
} catch { }
window.scrollTo(0, 0);
try { lenis.stop(); } catch { }
document.body.classList.add('is-loading');

/* ===================================================
   FUNCIONALIDADE 4: BOTÕES COM EFEITO RIPPLE
   Responsável por: Efeito visual de ondulação nos botões
   Dependências: DOM
   Módulo independente: SIM - pode ser separado completamente
   ==================================================== */
function setupButtonRipples() {
  const buttons = document.querySelectorAll('.sopy-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      btn.style.setProperty("--xPos", x + "px");
      btn.style.setProperty("--yPos", y + "px");
    });
  });
}

// Inicializar ripples após DOM estar pronto
document.addEventListener('DOMContentLoaded', setupButtonRipples);

/* ===================================================
   FUNCIONALIDADE 5: ANIMAÇÕES DE TEXTO (ESTILO OSMO)
   Responsável por: Split text e animações de entrada para títulos/parágrafos
   Dependências: GSAP, ScrollTrigger, SplitText/SplitType
   Módulo independente: SIM - pode ser separado
   Exclui: Elementos dentro de #hero e #faq (para preservar interatividade)
   ==================================================== */
// Esperar que tudo carregue completamente
window.addEventListener('load', function() {
  // Dar um tempo extra para garantir que tudo está pronto
  setTimeout(() => {
    // Confirmar que GSAP está carregado
    if (typeof gsap === "undefined") {
      console.error("GSAP não encontrado!");
      return;
    }
    
    // Registrar apenas plugins disponíveis (evita erro se CDN não carregou)
    if (typeof gsap.registerPlugin === "function") {
      const available = [];
      if (typeof ScrollTrigger !== 'undefined') available.push(ScrollTrigger);
      if (typeof CustomEase !== 'undefined') available.push(CustomEase);
      if (available.length) gsap.registerPlugin(...available);
    }
    
    // Criar custom ease exatamente como no Osmo
    if (typeof CustomEase === "function") {
      CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
    }
    
    // Adicionar CSS diretamente para garantir mascaramento
    const style = document.createElement('style');
    style.textContent = `
      .split-line, .split-word, .split-char {
        overflow: hidden !important;
        position: relative;
        display: inline-block;
        vertical-align: top;
      }
      .split-line > *, .split-word > *, .split-char > * {
        display: inline-block;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
    
  // Obter TODOS os elementos de texto exceto os do hero
  const titles = document.querySelectorAll('h1:not(#hero *), h2:not(#hero *), h3:not(#hero *), h4:not(#hero *), .tc-title, .tc-sub');
  const paragraphs = document.querySelectorAll('p:not(#hero *), .tc-quote, .sopy-subtitle, .sopy-benefits-card-label, .sopy-footer-desc');
  // Buttons only (exclude FAQ links entirely to keep them clickable)
  const buttons = document.querySelectorAll('.sopy-btn:not(#hero *), .sopy-tc-btn:not(#hero *)');

  console.log(`Found: ${titles.length} titles, ${paragraphs.length} paragraphs, ${buttons.length} buttons`);
    
    // Função para animar elemento
    function animateElement(element, type = 'lines') {
      // Garantir que o elemento existe
      if (!element || !element.textContent.trim()) return;
      
      console.log(`Animating ${element.tagName} with ${type}`);
      
      // 1. Quebrar o texto
      let result;
      try {
        if (type === 'lines') {
          result = new SplitType(element, { 
            types: 'lines',
            lineClass: 'split-line'
          });
        } else if (type === 'words') {
          result = new SplitType(element, { 
            types: 'words',
            wordClass: 'split-word'
          });
        } else {
          result = new SplitType(element, { 
            types: 'chars',
            charClass: 'split-char'
          });
        }
      } catch (e) {
        console.error(`Error splitting ${element.tagName}:`, e);
        return;
      }
      
      // 2. Adicionar spans internos para conteúdo
      let targets = [];
      if (type === 'lines' && result.lines) {
        result.lines.forEach(line => {
          const content = line.innerHTML;
          line.innerHTML = `<span>${content}</span>`;
          targets.push(line.children[0]);
        });
      } else if (type === 'words' && result.words) {
        result.words.forEach(word => {
          const content = word.innerHTML;
          word.innerHTML = `<span>${content}</span>`;
          targets.push(word.children[0]);
        });
      } else if (result.chars) {
        result.chars.forEach(char => {
          const content = char.innerHTML;
          char.innerHTML = `<span>${content}</span>`;
          targets.push(char.children[0]);
        });
      }
      
      // 3. Aplicar animação com stagger
      if (targets.length) {
        // Config baseada no tipo (como no exemplo Osmo)
        const config = {
          lines: { duration: 0.8, stagger: 0.08 },
          words: { duration: 0.6, stagger: 0.05 },
          letters: { duration: 0.4, stagger: 0.02 }
        };
        
        // Pegar config correta
        const { duration, stagger } = config[type === 'chars' ? 'letters' : type] || config.lines;
        
        // PRIMEIRO: Definir estado inicial (escondido)
        gsap.set(targets, {
          y: "110%",
          force3D: true
        });
        
        // DEPOIS: Animação GSAP para mostrar
        return gsap.to(targets, {
          y: "0%",
          duration: duration,
          stagger: stagger,
          ease: "osmo-ease",
          force3D: true,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
            onEnter: () => console.log(`⚡ Triggered: ${element.tagName}`)
          }
        });
      }
    }
    
    // Processar elementos por grupo e tipo
    // Skip titles inside FAQ to preserve click behavior
    titles.forEach(element => {
      if (element.closest('#faq')) return;
      animateElement(element, 'lines');
    });
    paragraphs.forEach(element => animateElement(element, 'words'));
    // Animate buttons by words (avoids weird letter spacing on buttons)
    buttons.forEach(element => animateElement(element, 'words'));

    // Add a simple fade/slide-in to FAQ cards (no text splitting)
    document.querySelectorAll('#faq .sopy-faq-accordion').forEach(acc => {
      gsap.from(acc, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'osmo-ease',
        scrollTrigger: {
          trigger: acc,
          start: 'top 90%',
          once: true
        }
      });
    });
    
    console.log("✅ Osmo animations initialized!");
    
    // Forçar ScrollTrigger refresh (guardado para evitar ReferenceError se não carregou)
    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
      try { ScrollTrigger.refresh(); } catch (e) { /* ignore */ }
    }
    
  }, 800); // Aumento do delay para garantir que o Lenis está pronto
});

/* ===================================================
   FUNCIONALIDADE 6: CÁPSULA 3D PRINCIPAL
   Responsável por: Renderização 3D, carregamento de modelos GLB, animação por scroll
   Dependências: Three.js, GLTFLoader, DRACOLoader (opcional)
   Módulo independente: PARCIAL - relacionado com FUNCIONALIDADE 8 (materiais)
   Inclui: Lazy loading, fallback models, scroll animation
   ==================================================== */
let THREE_READY = typeof THREE !== "undefined";
let renderer, scene, camera, capsuleGroup, rafId, running = true;
let threeEntered = false;
let gelA, gelB, gelC; // materiais para trocar cores
const threeWrap = document.getElementById("three-container");
// Hover state needs to be shared across animation loops
let hover = { x: 0, y: 0 };

// Intensidades do movimento
const THREE_CONFIG = {
  baseRotSpeed: 0,     // sem rotação automática
  floatAmp: 0,         // sem flutuação automática
  tiltLerp: 0,         // sem tilt automático
  tiltRangeX: 0,
  tiltRangeY: 0,
};

// Modelos por tema (se um arquivo não existir, cai em fallback ou no modelo default)
const MODELS = {
  aqua: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509853615_aqua.glb",
  citrus: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509855927_citrus.glb",
};
let currentTheme3D = "citrus";
let currentModelKey = null; // 'theme:url'
let pendingThemeForModel = null;

const COLORS = {
  // Aqua Blu: #083DA6 (dark), #076DF2 (brand), #0C87F2 (secondary), #1DDDF2 (accent)
  aqua: { a: 0x076DF2, b: 0x0C87F2, c: 0x1DDDF2 },
  // Citrus Lush: #5FD97E (brand), #91D9A3 (secondary), #167312 (dark), #D7D9D2 (accent-neutral)
  citrus: { a: 0x5FD97E, b: 0x91D9A3, c: 0xD7D9D2 },
};

// [... resto das funções 3D: initThree, enter3D, animateWithScroll, etc. ...]

/* ===================================================
   FUNCIONALIDADE 7: BOLHAS INTERATIVAS 3D
   Responsável por: Bolhas flutuantes com física, explosões de partículas, HDRI lighting
   Dependências: Three.js, RGBELoader (opcional para HDRI)
   Módulo independente: SIM - pode ser separado completamente
   Inclui: Raycasting, particle systems, realistic materials
   ==================================================== */
function initCapsuleBubbles() {
  // [... código completo das bolhas ...]
}

/* ===================================================
   FUNCIONALIDADE 8: TOGGLE DE TEMAS/FRAGRÂNCIAS
   Responsável por: Troca entre temas Aqua/Citrus, atualização de materiais 3D e conteúdo
   Dependências: GSAP, Three.js materials, DOM elements
   Relacionada com: FUNCIONALIDADE 6 (para troca de modelos 3D)
   Módulo independente: PARCIAL - depende dos materiais 3D
   ==================================================== */
const toggleBtns = gsap.utils.toArray(".fragrance-toggle .toggle-option");
function setTheme(theme) {
  document.body.classList.toggle("theme-citrus", theme === "citrus");
  document.body.classList.toggle("theme-aqua", theme === "aqua");

  const pal = theme === "citrus" ? COLORS.citrus : COLORS.aqua;

  if (gelA && gelB && gelC) {
    const toCol = (mat, hex) => {
      const c = new THREE.Color(hex);
      gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: "power2.out" });
    };
    toCol(gelA, pal.a);
    toCol(gelB, pal.b);
    toCol(gelC, pal.c);

    gsap.fromTo(
      capsuleGroup.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.04, y: 1.04, z: 1.04, yoyo: true, repeat: 1, duration: 0.18, ease: "power2.inOut" }
    );
  }

  // Update product card text based on theme
  const productTitle = document.querySelector('.product-title');
  const productCopy = document.querySelector('.product-copy');
  const productPrice = document.querySelector('.product-price');
  const productCta = document.querySelector('.sopy-product-cta');
  
  if (productTitle) {
    productTitle.textContent = theme === 'citrus' ? productTitle.getAttribute('data-citrus') : productTitle.getAttribute('data-aqua');
  }
  if (productCopy) {
    productCopy.textContent = theme === 'citrus' ? productCopy.getAttribute('data-citrus') : productCopy.getAttribute('data-aqua');
  }
  if (productPrice) {
    productPrice.textContent = theme === 'citrus' ? productPrice.getAttribute('data-citrus') : productPrice.getAttribute('data-aqua');
  }
  if (productCta) {
    productCta.textContent = theme === 'citrus' ? productCta.getAttribute('data-citrus') : productCta.getAttribute('data-aqua');
  }

  // Troca o modelo 3D para o tema
  swapModel(theme);
}

/* ===================================================
   FUNCIONALIDADE 9: AÇÕES DE COMPRA
   Responsável por: Handlers para botões de compra, integração com e-commerce
   Dependências: GSAP (para feedback visual), DOM
   Módulo independente: SIM - pode ser separado completamente
   Nota: Atualmente placeholder, pronto para integração Nuvemshop
   ==================================================== */
document.querySelectorAll('[data-action="sopy-buy"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".sopy-product-card");
    const sku = card?.dataset?.sku || "sopy";
    // aqui você integra com carrinho/Nuvemshop ou redireciona:
    console.log("Comprar SKU:", sku);
    gsap.fromTo(btn, { scale: 1 }, { scale: 0.96, yoyo: true, repeat: 1, duration: 0.12 });
  });
});

/* ===================================================
   FUNCIONALIDADE 10: INICIALIZAÇÃO FINAL
   Responsável por: Configurações padrão e log final
   Dependências: DOM
   ==================================================== */
// Tema padrão
document.body.classList.add("theme-citrus");

// Log de conclusão
console.log("[SOPY] Animações e eventos configurados.");