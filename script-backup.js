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

/* (removido) setupOsmoWordsAnimation em favor de initMaskedTextRevealGlobal */

/* main.js â€” Sopy Landing + E-com
   Requer: gsap + ScrollTrigger + SplitText + CustomEase + lenis + three + GLTFLoader
*/

/* =========================
/* ===================================================
   FUNCIONALIDADE 2: UTILITIES GLOBAIS
   Responsável por: Funções utilitárias compartilhadas
   Dependências: Nenhuma
   Módulo independente: SIM - pode ser separado
   ==================================================== */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

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
   Módulo independente: SIM - pode ser separado completamente
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

  function initAll() {
    // Build a stable list: only visible in DOM
    const candidates = Array.from(document.querySelectorAll(selector));
    candidates.forEach(createFor);
  }

  function destroyAll() {
    instances.forEach(({ split, tween, el }) => {
      if (tween && tween.kill) tween.kill();
      if (split && split.revert) split.revert();
      if (el && el.dataset) delete el.dataset.splitDone;
    });
    instances = [];
  }

/* ===================================================
   FUNCIONALIDADE 3: LENIS SCROLL SUAVE - INICIALIZAÇÃO
   Responsável por: Configurar scroll suave e integração com GSAP ticker
   Dependências: Lenis.js, GSAP
   Módulo independente: PARCIAL - core para outras animações de scroll
   ==================================================== */

/* ===================================================
   FUNCIONALIDADE 3: LENIS SCROLL SUAVE - INICIALIZAÇÃO
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


/* =========================
   4) Seção 3D â€“ cápsula
========================= */
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

function initThree() {
  if (!THREE_READY) return;
  if (!threeWrap) return;

  scene = new THREE.Scene();
  scene.background = null;

  const w = threeWrap.clientWidth;
  const h = threeWrap.clientHeight;

  // Force minimum dimensions if container is too small
  const finalW = Math.max(w, 400);
  const finalH = Math.max(h, 300);

  camera = new THREE.PerspectiveCamera(45, finalW / finalH, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, 1.75));
  renderer.setSize(finalW, finalH);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  threeWrap.appendChild(renderer.domElement);

  // luzes
  const amb = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(amb);

  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(3, 4, 2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.8);
  fill.position.set(-3, -1, 3);
  scene.add(fill);

  // grupo base
  capsuleGroup = new THREE.Group();
  scene.add(capsuleGroup);

  // Define orientação inicial vertical
  capsuleGroup.rotation.set(0, 0, 0);

  // Se após um tempo razoável ainda não há objeto, cria fallback e inicia animação
  setTimeout(() => {
    if (capsuleGroup.children.length === 0) {
      console.warn("Nenhum objeto 3D carregado até agora. Inserindo fallback...");
      createFallbackModel(currentTheme3D);
      ensureEnter3D();
    }
  }, 1200);

  // carrega o modelo do tema atual (ou pendente)
  const themeToLoad = pendingThemeForModel || currentTheme3D;
  swapModel(themeToLoad);
  // Inicia animação de scroll assim que o modelo for carregado
  start3DScrollAnimation();
  window.addEventListener("resize", onResizeThree);
}

function enter3D() {
  // animação de entrada
  capsuleGroup.scale.set(0, 0, 0);
  gsap.to(capsuleGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "power2.out", delay: 0.1 });

  // pin da seção 3D (temporariamente desabilitado para testar scroll)
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: "#capsula-3d",
      start: "top top",
      end: "+=100%",
      pin: false, // Desabilitado temporariamente
      scrub: false,
    });
  }

  // flutuação + rotação
  const state = { t: 0 };

  function animate() {
    if (!running) { rafId = null; return; }
    state.t += 0.016;
    const floatY = Math.sin(state.t * 1.6) * THREE_CONFIG.floatAmp;
    capsuleGroup.position.y = floatY;

    // rotação contínua leve + tilt do mouse
    capsuleGroup.rotation.y += THREE_CONFIG.baseRotSpeed;
    capsuleGroup.rotation.x += (hover.y - capsuleGroup.rotation.x) * THREE_CONFIG.tiltLerp;
    capsuleGroup.rotation.z += (hover.x - capsuleGroup.rotation.z) * THREE_CONFIG.tiltLerp;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }
  animate();

  // mouse tilt
  threeWrap.addEventListener("mousemove", (e) => {
    const r = threeWrap.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    hover.x = (nx - 0.5) * THREE_CONFIG.tiltRangeX;
    hover.y = (0.5 - ny) * THREE_CONFIG.tiltRangeY;
  });

  // pausa quando fora de viewport (economia)
  const io = new IntersectionObserver(
    (ents) => ents.forEach((en) => {
      const wasRunning = running;
      running = en.isIntersecting;
      if (running && !rafId) {
        rafId = requestAnimationFrame(animate);
      }
    }),
    { threshold: 0.05 }
  );
  io.observe(threeWrap);
}

// ========== 3D Scroll Down Effect ==========
// Faz o objeto 3D descer conforme o scroll na seção 3D
function animateWithScroll() {
  if (!running || !capsuleGroup) { rafId = null; return; }
  // Pega uma área maior que inclui a div intermediária antes da seção 3D
  const section = document.getElementById('capsula-3d');
  if (!section) { rafId = null; return; }
  const sectionRect = section.getBoundingClientRect();
  const sectionTop = window.scrollY + sectionRect.top;
  const sectionHeight = section.offsetHeight;
  const winH = window.innerHeight;
  
  // Expande a área de trigger para começar mais cedo (na div intermediária)
  const expandedStart = sectionTop - winH; // Começa 1 viewport antes da seção 3D
  const expandedHeight = sectionHeight + winH; // Área total expandida
  
  // Progresso baseado na área expandida
  const scrollY = window.scrollY || window.pageYOffset;
  let progress = clamp((scrollY - expandedStart) / expandedHeight, 0, 1);
  // Limita o progresso máximo para parar antes do final da seção
  // reduzimos para 0.6 para que o objeto e o card parem ainda mais cedo
  progress = Math.min(progress, 0.6);
  
  // Posição Y controlada por scroll com easing e leve oscilação ("dança")
  const yStart = 15.0; // início alto
  const yEnd = -9.5;   // ligeiramente mais alto no final para alinhar com o CTA
  // easing suave (easeInOutSine)
  const e = 0.5 - 0.5 * Math.cos(Math.PI * progress);
  let yBase = yStart + (yEnd - yStart) * e;
  // oscilação sutil no meio do caminho (amplitude reduzida nas extremidades)
  const midFactor = 1 - Math.abs(progress - 0.5) * 2; // 0 -> 1 -> 0
  const yWiggle = 0.6 * Math.sin(progress * Math.PI * 4) * midFactor;
  capsuleGroup.position.y = yBase + yWiggle;

  // Rotação: mapeia o progresso da seção para uma rotação completa de 360°
  // mantendo as pequenas oscilações já existentes em X e Z e adicionando
  // um pequeno componente de 'wiggle' em Y sobre a rotação principal.
  const rx = 0.08 * Math.sin(progress * Math.PI * 5);
  const ry = 0.06 * Math.sin(progress * Math.PI * 3 + 0.6);
  const rz = 0.04 * Math.sin(progress * Math.PI * 7 + 1.2);

  // O progresso foi limitado acima (max 0.6) para parar antes do fim da seção.
  // Normalizamos para 0..1 para mapear para 0..2PI (uma volta completa).
  const normalizedSpin = clamp(progress / 0.6, 0, 1);
  const spin = normalizedSpin * Math.PI * 2; // 360deg em radianos

  // Aplica rotação: Y recebe a volta completa + um pequeno ry para manter vivacidade
  capsuleGroup.rotation.set(rx, spin + ry, rz);
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(animateWithScroll);
}
// Substitui o animate padrão por esse após o modelo estar pronto
rafId = requestAnimationFrame(animateWithScroll);

function ensureEnter3D() {
  if (threeEntered) return;
  threeEntered = true;
  enter3D();
}

function onResizeThree() {
  if (!renderer || !camera) return;
  const w = Math.max(threeWrap.clientWidth, 400);
  const h = Math.max(threeWrap.clientHeight, 300);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ===================================================
   FUNCIONALIDADE 7: BOLHAS INTERATIVAS 3D
   Responsável por: Bolhas flutuantes com física, explosões de partículas, HDRI lighting
   Dependências: Three.js, RGBELoader (opcional para HDRI)
   Módulo independente: SIM - pode ser separado completamente
   Inclui: Raycasting, particle systems, realistic materials
   ==================================================== */
function initCapsuleBubbles() {
  const container = document.querySelector('.sopy-capsule-bubbles');
  if (!container || typeof THREE === 'undefined') return;

  // Evita inicialização múltipla
  if (container.__bubblesInitialized) return;
  container.__bubblesInitialized = true;

  // --- CONFIGURAÇÃO BÁSICA ---
  const scene = new THREE.Scene();
  // mantém o fundo transparente para integrar com a seção
  scene.background = null;
  const rect = container.getBoundingClientRect();
  const camera = new THREE.PerspectiveCamera(75, rect.width / Math.max(1, rect.height), 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(rect.width, Math.max(1, rect.height));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8; // Aumenta um pouco mais a exposição
  // insere o canvas dentro do container para respeitar stacking e clipping
  container.appendChild(renderer.domElement);
  // garante preenchimento do container
  Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });

  // --- ILUMINAÇÃO E AMBIENTE (HDRI) ---
  let envMap;
  const rgbeLoader = THREE.RGBELoader ? new THREE.RGBELoader() : null;
  let hdrLoaded = false;
  if (rgbeLoader) {
    rgbeLoader
      .setPath('https://threejs.org/examples/textures/equirectangular/')
      .load(
        'venice_sunset_1k.hdr',
        function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          envMap = texture;
          scene.environment = envMap;
          // Mantém background transparente (sem definir scene.background)
          hdrLoaded = true;
          createInitialBubbles();
        },
        undefined,
        function () {
          // Falha ao carregar HDRI: segue sem envMap
          console.warn('[Bubbles] Falha ao carregar HDRI. Prosseguindo sem environment map.');
          createInitialBubbles();
        }
      );
    // Fallback de tempo: se HDRI demorar, inicia mesmo assim
    setTimeout(() => { if (!hdrLoaded) createInitialBubbles(); }, 2000);
  } else {
    // Sem RGBELoader disponível: segue sem HDRI
    createInitialBubbles();
  }

  // Se o container ainda não tiver tamanho estável, tenta ajustar em seguida
  if (rect.width < 10 || rect.height < 10) {
    requestAnimationFrame(() => {
      const r2 = container.getBoundingClientRect();
      camera.aspect = r2.width / Math.max(1, r2.height);
      camera.updateProjectionMatrix();
      renderer.setSize(r2.width, Math.max(1, r2.height));
    });
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // --- OBJETOS (AS BOLHAS) ---
  const bubbles = [];
  const bubbleCount = 10; // Mais bolhas para preencher mais o espaço
  const bubbleGeometry = new THREE.SphereGeometry(1, 64, 64);

  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    metalness: 0.0,
    roughness: 0.06,
    transmission: 0.55,
    transparent: true,
    opacity: 0.92,
    ior: 1.33,
    envMapIntensity: 2.2,
    thickness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06
  });

  function createBubble() {
    const material = bubbleMaterial.clone();
    if (envMap) {
      material.envMap = envMap;
      material.transmission = 1.0;
      material.opacity = 0.85;
    } else {
      // fallback sem envMap: menos transmissão e mais opacidade
      material.transmission = 0.0;
      material.opacity = 0.35;
      material.roughness = 0.15;
      material.metalness = 0.0;
      material.clearcoat = 0.6;
      material.clearcoatRoughness = 0.2;
    }

    const bubble = new THREE.Mesh(bubbleGeometry, material);

  bubble.position.x = THREE.MathUtils.randFloatSpread(40); // ~[-20,20]
  bubble.position.y = THREE.MathUtils.randFloat(-25, -15); // começa visível na parte inferior
  bubble.position.z = THREE.MathUtils.randFloatSpread(10); // ~[-5,5]

    const scale = THREE.MathUtils.randFloat(0.4, 2.0); // Ainda mais variação no tamanho
    bubble.scale.set(scale, scale, scale);

    bubble.userData = {
      speed: THREE.MathUtils.randFloat(0.05, 0.15),
      // Movimento lateral mais natural
      amplitudeX: THREE.MathUtils.randFloat(1, 4), // Amplitude da oscilação (1 a 4 unidades)
      frequencyX: THREE.MathUtils.randFloat(0.5, 1.5), // Frequência da oscilação (mais lento/rápido)
      oscillationOffset: Math.random() * Math.PI * 2,
      originalX: bubble.position.x // Guarda a posição X inicial
    };
    
    scene.add(bubble);
    bubbles.push(bubble);
  }

  function createInitialBubbles() {
    for (let i = 0; i < bubbleCount; i++) {
      createBubble();
    }
    animate();
  }

  // --- INTERAÇÃO (CLIQUE E EXPLOSÃO) ---

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let particleSystems = []; // Renomeado para evitar conflito e ser mais descritivo

  const particleTexture = new THREE.CanvasTexture(generateParticleTexture());

  function generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Maior resolução para partículas
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function onMouseClick(event) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    mouse.x = (x / rect.width) * 2 - 1;
    mouse.y = -(y / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(bubbles);

    if (intersects.length > 0) {
      const clickedBubble = intersects[0].object;
      
      createExplosion(clickedBubble.position, clickedBubble.scale.x);
      
      scene.remove(clickedBubble);
      bubbles.splice(bubbles.indexOf(clickedBubble), 1);
      
      setTimeout(createBubble, 500); 
    }
  }

  container.addEventListener('click', onMouseClick);

  function createExplosion(position, bubbleScale) {
    const particleCount = 30; // Mais partículas para uma explosão mais densa
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3 * bubbleScale, // Tamanho base da partícula
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true // Habilita cores por vértice para controlar a cor individualmente
    });

    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const lives = []; // Vida atual
    const maxLives = []; // Vida máxima (para variar a duração)
    const colors = []; // Cores das partículas
    const sizes = []; // Tamanhos individuais das partículas

    const baseColor = new THREE.Color(0xADD8E6); // Cor base da bolha
    const white = new THREE.Color(0xFFFFFF);

    for (let i = 0; i < particleCount; i++) {
      positions.push(position.x, position.y, position.z);
      
      const speed = THREE.MathUtils.randFloat(0.3, 0.8) * bubbleScale; // Velocidade inicial mais alta
      velocities.push(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
      );

      const life = THREE.MathUtils.randFloat(0.8, 1.5); // Vida útil mais variada
      lives.push(life);
      maxLives.push(life);

      // Cor: Começa branco e transiciona para a cor da bolha ou levemente azul
      const particleColor = baseColor.clone().lerp(white, THREE.MathUtils.randFloat(0.2, 0.8));
      colors.push(particleColor.r, particleColor.g, particleColor.b);

      sizes.push(THREE.MathUtils.randFloat(0.5, 1.5) * particleMaterial.size); // Tamanho individual
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('life', new THREE.Float32BufferAttribute(lives, 1));
    particleGeometry.setAttribute('maxLife', new THREE.Float32BufferAttribute(maxLives, 1));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1)); // Adiciona atributo de tamanho

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particleSystems.push(particleSystem);
  }

  // --- ANIMAÇÃO ---

  const clock = new THREE.Clock();
  const gravity = new THREE.Vector3(0, -0.05, 0); // Leve gravidade para as partículas (simulando bolhas subindo mais devagar)

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Tempo desde o último quadro

    // Animação das bolhas
    bubbles.forEach(bubble => {
      // Sobe a bolha
      bubble.position.y += bubble.userData.speed * delta * 60;

      // Oscilação lateral mais controlada e natural
      const time = performance.now() * 0.001; // Tempo em segundos
      bubble.position.x = bubble.userData.originalX + Math.sin(time * bubble.userData.frequencyX + bubble.userData.oscillationOffset) * bubble.userData.amplitudeX;


      if (bubble.position.y > 25) {
        bubble.position.y = -25;
        bubble.position.x = THREE.MathUtils.randFloatSpread(40);
        bubble.userData.originalX = bubble.position.x;
        bubble.userData.oscillationOffset = Math.random() * Math.PI * 2;
      }
    });

    // Animação das partículas de explosão
    particleSystems.forEach((system, systemIndex) => {
      const positions = system.geometry.attributes.position.array;
      const velocities = system.geometry.attributes.velocity.array;
      const lives = system.geometry.attributes.life.array;
      const maxLives = system.geometry.attributes.maxLife.array;
      const colors = system.geometry.attributes.color.array;
      const sizes = system.geometry.attributes.size.array; // Pega o atributo de tamanho individual

      let allParticlesDead = true;

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;

        lives[particleIndex] -= delta; // Diminui a vida com base no tempo real

        if (lives[particleIndex] > 0) {
          allParticlesDead = false;

          // Atualiza velocidade com gravidade (ou flutuabilidade oposta)
          // Para bolhas, a "gravidade" real seria para cima. Vamos simular uma leve desaceleração.
          // velocities[i+1] += gravity.y * delta; // Se quiser que as partículas "caiam"

          // Move a partícula
          positions[i] += velocities[i] * delta * 60;
          positions[i + 1] += velocities[i + 1] * delta * 60;
          positions[i + 2] += velocities[i + 2] * delta * 60;

          // Fade out (opacidade e cor)
          const lifeRatio = lives[particleIndex] / maxLives[particleIndex];
          system.material.opacity = Math.max(0, lifeRatio); // Opacidade baseada na vida

          // A cor também faz fade-out (escurecendo ou ficando transparente)
          const initialColor = new THREE.Color(colors[i], colors[i+1], colors[i+2]);
          const finalColor = new THREE.Color(0x000000); // Para onde a cor irá (preto ou transparente)
          initialColor.lerp(finalColor, 1 - lifeRatio);
          system.geometry.attributes.color.setXYZ(particleIndex, initialColor.r, initialColor.g, initialColor.b);

          // Ajusta o tamanho da partícula (encolhe)
          // system.material.size = sizes[particleIndex] * Math.pow(lifeRatio, 0.5); // Encolhe gradualmente
          // Nota: Para Three.Points, `material.size` afeta todas as partículas. Para tamanhos individuais, precisa de um shader personalizado.
          // Por enquanto, vamos deixar `material.size` fixo para o sistema e controlar a opacidade.
          // Se quisermos tamanhos individuais em PointsMaterial, precisamos de um shader customizado (mais complexo).
        } else {
          positions[i] = positions[i + 1] = positions[i + 2] = 10000; // Move para fora da vista
        }
      }

      system.geometry.attributes.position.needsUpdate = true;
      system.geometry.attributes.life.needsUpdate = true;
      system.geometry.attributes.color.needsUpdate = true; // Atualiza as cores

      if (allParticlesDead) {
        scene.remove(system);
        particleSystems.splice(systemIndex, 1);
      }
    });

    renderer.render(scene, camera);
  }

  // --- RESPONSIVIDADE ---
  function onWindowResize() {
    const r = container.getBoundingClientRect();
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, Math.max(1, r.height));
  }
  window.addEventListener('resize', onWindowResize);
}

// init once three container exists; refresh on resize
document.addEventListener('DOMContentLoaded', () => {
  initCapsuleBubbles();
});



// Lazy-init Three.js: só quando a seção 3D entrar na viewport
(function lazyInitThree() {
  const target = document.getElementById("capsula-3d");
  if (!target) return;

  const triggerInit = () => {
    if (renderer) return; // já iniciado
    const ensure = () => {
      if (!THREE_READY && typeof THREE !== "undefined") THREE_READY = true;
      if (THREE_READY) {
        initThree();
        io && io.disconnect();
      } else {
        setTimeout(ensure, 100);
      }
    };
    ensure();
  };

  // Usa IntersectionObserver para não depender do ScrollTrigger aqui
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) triggerInit();
    });
  }, { threshold: 0.15 });
  io.observe(target);

  // Se preferir, também inicia ao tocar na Ã¢ncora via hash
  window.addEventListener("hashchange", () => {
    if (location.hash === "#capsula-3d") triggerInit();
  });
})();

// Fallback simples caso o GLB não carregue
function createFallbackModel(theme = "aqua") {
  if (!capsuleGroup || !THREE_READY) return;
  const isCitrus = theme === "citrus";
  const geo = isCitrus
    ? new THREE.TorusKnotGeometry(0.8, 0.24, 180, 16)
    : new THREE.IcosahedronGeometry(1, 2);
  const mat = new THREE.MeshStandardMaterial({ color: isCitrus ? 0x5FD97E : 0x076DF2, roughness: 0.35, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.isFallback = true;
  capsuleGroup.add(mesh);
  
  // SEMPRE força a rotação inicial vertical no fallback também
  capsuleGroup.rotation.set(0, 0, 0);
  capsuleGroup.position.y = 15.0;
}

// Troca o modelo conforme o tema
function swapModel(theme = "aqua") {
  currentTheme3D = theme;
  if (!THREE_READY || !capsuleGroup) { pendingThemeForModel = theme; return; }

  const url = (window.SOPY && SOPY.assetUrl) ? SOPY.assetUrl(MODELS[theme] || MODELS.aqua) : (MODELS[theme] || MODELS.aqua);
  const key = `${theme}:${url}`;
  if (currentModelKey === key) return; // já está carregado

  const loader = new THREE.GLTFLoader();
  if (THREE.DRACOLoader) {
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);
  }

  // efeito sutil de troca
  gsap.fromTo(capsuleGroup.scale, { x: 1, y: 1, z: 1 }, { x: 0.92, y: 0.92, z: 0.92, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut" });

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene || gltf.scenes?.[0];
      if (!model) {
        console.warn("GLB sem scene para o tema:", theme, "â€” usando fallback");
        clearNonFallbackChildren();
        createFallbackModel(theme);
        ensureEnter3D();
        currentModelKey = key;
        bindGelMaterials(null);
        return;
      }

      normalizeAndAddModel(model);
      currentModelKey = key;
      ensureEnter3D();
    },
    undefined,
    (err) => {
      console.warn("Falha ao carregar modelo do tema", theme, url, err);
      clearNonFallbackChildren();
      createFallbackModel(theme);
      ensureEnter3D();
      currentModelKey = key;
      bindGelMaterials(null);
    }
  );
}

function normalizeAndAddModel(model) {
  // Remove fallbacks e anteriores
  clearNonFallbackChildren();

  // Centraliza e normaliza escala
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const target = 1.8;
  model.scale.setScalar(target / maxDim);

  // Materiais visíveis
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = o.receiveShadow = false;
      if (o.material) {
        if ("transparent" in o.material) o.material.transparent = true;
        if ("roughness" in o.material) o.material.roughness = 0.35;
        if ("metalness" in o.material) o.material.metalness = 0.05;
      }
    }
  });

  capsuleGroup.add(model);
  bindGelMaterials(model);
  
  // SEMPRE força a rotação inicial vertical após adicionar qualquer modelo
  capsuleGroup.rotation.set(0, 0, 0);
  capsuleGroup.position.y = 100.0; // Posição inicial alta
}

function bindGelMaterials(model) {
  if (!model) { gelA = gelB = gelC = null; return; }
  // Tenta capturar até 3 materiais principais
  const mats = [];
  model.traverse((o) => { if (o.isMesh && o.material) mats.push(o.material); });
  gelA = mats[0] || null;
  gelB = mats[1] || gelA;
  gelC = mats[2] || gelA;
}

function clearNonFallbackChildren() {
  const toRemove = capsuleGroup.children.filter((c) => !c.userData?.isFallback);
  toRemove.forEach((obj) => capsuleGroup.remove(obj));
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
toggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-active")) return;
    toggleBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const theme = btn.dataset.theme === "citrus" ? "citrus" : "aqua";
    setTheme(theme);
  });
});

// Toggle animado de produtos: troca tema do site
const productToggle = document.getElementById('product-toggle');
if (productToggle) {
  productToggle.addEventListener('change', function() {
    if (productToggle.checked) {
      document.body.classList.add('theme-aqua');
      document.body.classList.remove('theme-citrus');
    } else {
      document.body.classList.add('theme-citrus');
      document.body.classList.remove('theme-aqua');
    }
    // Se existir função setTheme/theme 3D, chame aqui
    if (typeof setTheme === 'function') {
      setTheme(productToggle.checked ? 'aqua' : 'citrus');
    }
  });
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

// Custom cursor removed: using default system cursor everywhere.

/* ===================================================
   FUNCIONALIDADE 10: INICIALIZAÇÃO FINAL
   Responsável por: Configurações padrão e log final
   Dependências: DOM
   ==================================================== */
// Tema padrão
document.body.classList.add("theme-citrus");

// Log de conclusão
console.log("[SOPY] Animações e eventos configurados.");

/* ===================================================
   RESUMO FINAL DE FUNCIONALIDADES PARA DIVISÃO MODULAR:
   
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



