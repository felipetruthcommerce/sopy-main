// --- PARTE 1: DEFINIÇÃO DAS FUNÇÕES DE APOIO ---

function setupLenis() {
    console.log('[SETUP] Inicializando Lenis (Scroll Suave)...');
    const lenis = new Lenis();
    window.lenis = lenis; // Deixa o Lenis acessível globalmente
    
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Sempre iniciar no topo ao recarregar
    try {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch {}
    window.scrollTo(0, 0);
}

function setupGsapPlugins() {
    console.log('[SETUP] Registrando plugins e eases do GSAP...');
    if (typeof gsap === "undefined" || window.__gsapPluginsRegistered) return;

    const plugs = [];
    if (typeof ScrollTrigger !== "undefined") plugs.push(ScrollTrigger);
    if (typeof CustomEase !== "undefined") plugs.push(CustomEase);
    if (typeof SplitText !== "undefined") plugs.push(SplitText); // Adicione se você usa SplitText
    
    if (plugs.length) gsap.registerPlugin(...plugs);

    if (typeof CustomEase !== "undefined") {
        CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
    }
    
    window.__gsapPluginsRegistered = true;
}

function setupButtonRipples() {
    console.log('[SETUP] Configurando efeito ripple nos botões...');
    const rippleSelectors = ['.sopy-btn', '.sopy-tc-btn', '.sopy-product-cta'];
    document.querySelectorAll(rippleSelectors.join(',')).forEach(btn => {
        btn.addEventListener('mousemove', (event) => {
            const rect = btn.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            btn.style.setProperty("--xPos", x + "px");
            btn.style.setProperty("--yPos", y + "px");
        });
    });
}


function initTextAnimations() {
    console.log('[SETUP] Inicializando animações de texto (estilo Osmo)...');
    
    // ... (O código do 'style' e dos seletores continua o mesmo)
    const style = document.createElement('style');
    style.textContent = `
      .split-line, .split-word { overflow: hidden !important; display: inline-block; vertical-align: top; }
      .split-line > span, .split-word > span { display: inline-block; will-change: transform; }
    `;
    document.head.appendChild(style);

    const titles = document.querySelectorAll('h1:not(#hero *), h2:not(#hero *), h3:not(#hero *), h4:not(#hero *), .tc-title, .tc-sub');
    const paragraphs = document.querySelectorAll('p:not(#hero *), .tc-quote, .sopy-subtitle, .sopy-benefits-card-label, .sopy-footer-desc');
    const buttons = document.querySelectorAll('.sopy-btn:not(#hero *), .sopy-tc-btn:not(#hero *)');

    console.log(`[TEXT] Encontrados para animar: ${titles.length} títulos, ${paragraphs.length} parágrafos, ${buttons.length} botões.`);
    
    // ✅ VERSÃO "SUPER-DEBUG" DA FUNÇÃO
    function animateElement(element, type = 'lines') {
        if (!element || !element.textContent.trim()) {
            // console.log(`[DEBUG] Elemento pulado (vazio ou não existe):`, element);
            return;
        }
        
        // ✅ NOVO LOG: Nos diz qual elemento está sendo processado
        console.log(`[DEBUG] Processando elemento: <${element.tagName.toLowerCase()}> com texto "${element.textContent.substring(0, 20)}..."`);

        try {
            const split = new SplitType(element, { types: type, lineClass: 'split-line', wordClass: 'split-word' });
            const targets = type === 'lines' ? split.lines : split.words;

            if (targets && targets.length > 0) {
                targets.forEach(target => {
                    const content = target.innerHTML;
                    target.innerHTML = `<span>${content}</span>`;
                });
                
                const spans = targets.map(target => target.children[0]).filter(Boolean);
                
                if (spans.length > 0) {
                    gsap.set(spans, { y: "110%" });
                    gsap.to(spans, {
                        y: "0%",
                        duration: type === 'lines' ? 0.8 : 0.6,
                        stagger: type === 'lines' ? 0.08 : 0.05,
                        ease: "osmo-ease",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 85%",
                            once: true,
                            // ✅ NOVO LOG: Confirma que o ScrollTrigger foi criado
                            onEnter: () => console.log(`✅ [TRIGGER ATIVADO] Animação de texto em: <${element.tagName.toLowerCase()}>`)
                        }
                    });
                } else {
                     console.warn(`[DEBUG] WARN: SplitType criou targets, mas não encontrou spans para animar em:`, element);
                }
            } else {
                console.warn(`[DEBUG] WARN: SplitType não criou 'lines' ou 'words' para o elemento:`, element);
            }
        } catch (e) {
            console.error(`[DEBUG] ERRO ao tentar animar o elemento:`, element, e);
        }
    }
    
    console.log('[DEBUG] --- INICIANDO PROCESSAMENTO DE TÍTULOS ---');
    titles.forEach(el => {
        if (!el.closest('#faq')) {
            animateElement(el, 'lines');
        } else {
            console.log(`[DEBUG] Pulando título do FAQ (intencional): "${el.textContent.substring(0, 20)}..."`);
        }
    });

    console.log('[DEBUG] --- INICIANDO PROCESSAMENTO DE PARÁGRAFOS ---');
    paragraphs.forEach(el => animateElement(el, 'words'));

    console.log('[DEBUG] --- INICIANDO PROCESSAMENTO DE BOTÕES ---');
    buttons.forEach(el => animateElement(el, 'words'));

    console.log("✅ Animações de texto configuradas!");
}


// ===================================
//  PARTE 2: DEFINIÇÃO DAS FUNÇÕES DO 3D E DO TOGGLE
// ===================================

let THREE_READY = typeof THREE !== "undefined";
let renderer, scene, camera, capsuleGroup, gelA, gelB, gelC;

const MODELS = {
    aqua: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509853615_aqua.glb",
    citrus: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509855927_citrus.glb",
};

const COLORS = {
    aqua: { a: '#076DF2', b: '#0C87F2', c: '#1DDDF2' },
    citrus: { a: '#5FD97E', b: '#91D9A3', c: '#D7D9D2' },
};

function swapModel(theme) {
    console.log(`[3D] Tentando trocar para o modelo: ${theme}`);
    if (!THREE_READY || !capsuleGroup) {
        console.log(`[3D] 3D ainda não inicializado. Armazenando tema ${theme} para aplicar depois.`);
        window.__pendingTheme = theme;
        return;
    }

    const url = MODELS[theme];
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(url, 
        (gltf) => {
            console.log(`✅ [3D] Modelo '${theme}' carregado com sucesso!`);
            while (capsuleGroup.children.length) {
                capsuleGroup.remove(capsuleGroup.children[0]);
            }
            const model = gltf.scene;
            capsuleGroup.add(model);

            // aumenta/refina o brilho do material PBR com o environment
// Depois de: capsuleGroup.add(model);
model.traverse((obj) => {
  if (obj.isMesh && obj.material) {
    // deixa mais “gel” com highlights bonitos
    if ('roughness' in obj.material) obj.material.roughness = 0.3;  // menos áspero
    if ('metalness' in obj.material) obj.material.metalness = 0.1;  // um toque metálico
    if ('envMapIntensity' in obj.material) obj.material.envMapIntensity = 0.35; // reflexo discreto
    obj.material.needsUpdate = true;
  }
});


            
            // Re-captura os materiais após carregar o novo modelo
            gelA = model.getObjectByName('Gel_A')?.material;
            gelB = model.getObjectByName('Gel_B')?.material;
            gelC = model.getObjectByName('Gel_C')?.material;
            
            // Aplica a cor do tema atual aos novos materiais
            const pal = theme === "citrus" ? COLORS.citrus : COLORS.aqua;
            if (gelA && gelB && gelC) {
                 const toCol = (mat, hex) => {
                    const c = new THREE.Color(hex);
                    gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: "power2.out" });
                };
                toCol(gelA, pal.a);
                toCol(gelB, pal.b);
                toCol(gelC, pal.c);
            }
        }, 
        undefined, 
        (error) => {
            console.error(`❌ [3D] FALHA CRÍTICA ao carregar modelo '${theme}':`, error);
        }
    );
}

function setTheme(theme) {
    console.log(`[TEMA] Trocando para o tema: ${theme}`);
    document.body.classList.toggle("theme-citrus", theme === "citrus");
    document.body.classList.toggle("theme-aqua", theme === "aqua");

    // Sincroniza o estado visual do toggle com o tema atual
    try {
        const toggleEl = document.getElementById('product-toggle');
        if (toggleEl) {
            const shouldBeChecked = theme === 'aqua';
            if (toggleEl.checked !== shouldBeChecked) {
                console.log('[TEMA] Sync toggle → checked:', shouldBeChecked);
                toggleEl.checked = shouldBeChecked;
            }
        }
    } catch (e) {
        console.warn('[TEMA] Falha ao sincronizar toggle:', e);
    }

    const pal = theme === "citrus" ? COLORS.citrus : COLORS.aqua;
    if (gelA && gelB && gelC) {
        const toCol = (mat, hex) => {
            const c = new THREE.Color(hex);
            gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: "power2.out" });
        };
        toCol(gelA, pal.a);
        toCol(gelB, pal.b);
        toCol(gelC, pal.c);
    }

    // Atualiza a imagem do card da Sopy dependendo do tema
    try {
        const sopyCardImage = document.querySelector('.sopy-card-image');
        if (sopyCardImage) {
            const newSrc = theme === 'citrus' 
                ? sopyCardImage.getAttribute('data-citrus')
                : sopyCardImage.getAttribute('data-aqua');
            
            if (newSrc && !sopyCardImage.src.includes(newSrc.split('/').pop())) {
                console.log(`[TEMA] Trocando imagem do card para ${theme}:`, newSrc);
                
                // Preload da imagem para evitar flicker
                const img = new Image();
                img.onload = () => {
                    sopyCardImage.src = newSrc;
                    console.log(`[TEMA] Imagem ${theme} carregada com sucesso`);
                };
                img.onerror = () => {
                    console.warn(`[TEMA] Erro ao carregar imagem ${theme}:`, newSrc);
                };
                img.src = newSrc;
            }
        }
    } catch (e) {
        console.warn('[TEMA] Falha ao trocar imagem do card:', e);
    }
    
    // ... (seu código para atualizar textos do card de produto) ...

    // Atualiza também os textos do card de produto (se presentes no DOM).
    try {
        const cta = document.querySelector('.capsule-3d-cta');
        if (cta) {
            const titleEl = cta.querySelector('.product-title');
            const priceEl = cta.querySelector('.product-price');
            const copyEl  = cta.querySelector('.product-copy');
            const btnEl   = cta.querySelector('.sopy-product-cta');

            const pick = (el, key) => {
                if (!el) return;
                const dataKey = `data-${key}`;
                // prefer data attribute for the theme, fallback to existing text
                const v = el.getAttribute(dataKey);
                if (v != null) el.textContent = v;
            };

            // data attributes are data-citrus / data-aqua on each element
            pick(titleEl, theme === 'citrus' ? 'citrus' : 'aqua');
            pick(priceEl, theme === 'citrus' ? 'citrus' : 'aqua');
            pick(copyEl,  theme === 'citrus' ? 'citrus' : 'aqua');
            // For the CTA button, some authors used data-aqua/data-citrus on the element itself
            if (btnEl) {
                const btnData = btnEl.getAttribute(theme === 'citrus' ? 'data-citrus' : 'data-aqua');
                if (btnData != null) btnEl.textContent = btnData;
            }
        }
    } catch (e) {
        console.warn('[TEMA] Falha ao atualizar textos do CTA:', e);
    }

    // Update benefit titles colors based on theme (CSS handles this via body class)
    // Force a repaint to ensure theme colors are applied immediately
    const benefitTitles = document.querySelectorAll('.benefit-title');
    benefitTitles.forEach(title => {
        const h2 = title.querySelector('h2');
        if (h2) h2.style.color = h2.style.color; // force repaint
    });

    swapModel(theme);
}

function initThree() {
    const threeWrap = document.getElementById("three-container");
    if (!THREE_READY || !threeWrap || threeWrap.__initialized) return;
    threeWrap.__initialized = true;

    console.log("[3D] Inicializando cena Three.js...");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, threeWrap.clientWidth / threeWrap.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 3.2);

// RENDERER
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(threeWrap.clientWidth, threeWrap.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1; // um tiquinho mais claro que 1.0
renderer.outputEncoding = THREE.SRGBColorSpace; // use sRGBEncoding se sua versão for antiga
threeWrap.appendChild(renderer.domElement);

// LUZES (look “foto”: key forte, fill leve, rim suave)
const amb  = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(amb);

const key  = new THREE.DirectionalLight(0xffffff, 1.6); // brilho principal
key.position.set(2.8, 3.5, 2.2);
scene.add(key);

const fill = new THREE.DirectionalLight(0xffffff, 0.5); // suaviza sombras
fill.position.set(-2.2, 0.6, 2.0);
scene.add(fill);

const rim  = new THREE.DirectionalLight(0xffffff, 0.35); // recorte por trás
rim.position.set(0, 1.8, -2.4);
scene.add(rim);

// ENV MAP (reflexo discreto tipo estúdio)
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

capsuleGroup = new THREE.Group();
scene.add(capsuleGroup);

new THREE.RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr', (hdr) => {
    const tex = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = tex;   // PBR reflections
    scene.background  = null;  // mantemos teu gradiente da página
    hdr.dispose();
    pmrem.dispose();
  }, undefined, (e) => console.warn('[3D] Falha ao carregar HDRI:', e));

    // === SPIN ON SCROLL (giro por scroll – sem pin) ===
(function setupCapsuleSpinOnScroll(){
  const spinSection = document.getElementById('capsula-3d');
  if (!spinSection || !capsuleGroup) return;

  const TWO_PI = Math.PI * 2;
  let spinRaf = null;
  let lastP = -1; // para debouncing

  // progresso 0..1: começa quando o topo da seção encosta no fundo da viewport
  // e termina quando o fundo da seção encosta no topo da viewport
  function computeProgress(){
    const rect = spinSection.getBoundingClientRect();
    const vh   = window.innerHeight;
    const total = rect.height + vh;     // faixa “vista” total
    const seen  = vh - rect.top;        // quanto da faixa já passou
    return Math.max(0, Math.min(1, seen / total));
  }

  function applySpin(p){
     // --- limites do trecho em que acontece o giro (frações do progresso 0..1)
  const SPIN_START = 0.05;  // começa a girar depois de 5% da seção
  const SPIN_END   = 0.65;  // termina o giro em 65% da seção

  // memoriza o yaw inicial do modelo na primeira atualização
  if (window.__capsuleBaseYaw == null) {
    window.__capsuleBaseYaw = capsuleGroup.rotation.y || 0;
  }

  // normaliza o progresso p para o intervalo [SPIN_START..SPIN_END]
  let t = (p - SPIN_START) / (SPIN_END - SPIN_START);
  t = Math.max(0, Math.min(1, t)); // clamp 0..1

  // faz exatamente 360° nesse intervalo e PARA
  const yaw = window.__capsuleBaseYaw + t * (Math.PI * 2);
  capsuleGroup.rotation.y = yaw;

  // Revelar títulos de benefícios baseado no progresso do scroll
  revealBenefitTitles(p);
  }

  function revealBenefitTitles(progress) {
    const titles = document.querySelectorAll('.benefit-title');
    
    titles.forEach(title => {
      const revealPoint = parseFloat(title.dataset.reveal || 0);
      const shouldReveal = progress >= revealPoint;
      const isRevealed = title.classList.contains('revealed');
      
      if (shouldReveal && !isRevealed) {
        title.classList.add('revealed');
        
        // Aplicar animação GSAP similar ao título principal
        const h2 = title.querySelector('h2');
        if (h2 && typeof gsap !== 'undefined') {
          // Set initial state
          gsap.set(h2, {
            opacity: 0,
            y: 50,
            scale: 0.8
          });
          
          // Animate in with similar timing to main title
          gsap.to(h2, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            delay: (revealPoint - 0.2) * 0.3 // stagger based on reveal point
          });
        }
      } else if (!shouldReveal && isRevealed) {
        // Remove a revelação se o usuário scrollar para trás
        title.classList.remove('revealed');
        const h2 = title.querySelector('h2');
        if (h2 && typeof gsap !== 'undefined') {
          gsap.to(h2, {
            opacity: 0,
            y: 30,
            scale: 0.9,
            duration: 0.6,
            ease: "power2.in"
          });
        }
      }
    });
  }

  function onScrollSpin(){
    if (spinRaf) return;
    spinRaf = requestAnimationFrame(()=>{
      spinRaf = null;
      const p = computeProgress();
      if (p === lastP) return;
      lastP = p;
      applySpin(p);
    });
  }

  // usa Lenis se existir; senão, scroll nativo
  if (window.lenis && typeof window.lenis.on === 'function'){
    window.lenis.on('scroll', onScrollSpin);
  } else {
    window.addEventListener('scroll', onScrollSpin, { passive: true });
  }
  window.addEventListener('resize', onScrollSpin);

  // estado inicial
  onScrollSpin();
})();

// === MOSTRAR O CARD DO PRODUTO NA SEÇÃO 3D E HINT NO TOGGLE ===
(function setupCapsuleCtaTrigger(){
    // aguarda até que o DOM e o ScrollTrigger estejam prontos
    const trySetup = () => {
        const section = document.getElementById('capsula-3d');
        const cta = document.querySelector('.capsule-3d-cta');
        const toggleContainer = document.querySelector('.product-toggle-container');
        
        if (!section || !cta || !toggleContainer) return;
        if (typeof ScrollTrigger === 'undefined') return;

        // criar hint "CLIQUE AQUI" acima do toggle se não existir
        if (!toggleContainer.querySelector('.toggle-hint')) {
            const hint = document.createElement('div');
            hint.className = 'toggle-hint';
            hint.innerHTML = `<span>CLIQUE AQUI</span>`;
            toggleContainer.insertBefore(hint, toggleContainer.firstChild);
            
            // esconder o hint APENAS quando o toggle é usado (não quando clica no texto)
            const toggleInput = toggleContainer.querySelector('#product-toggle');
            if (toggleInput) {
                toggleInput.addEventListener('change', () => hint.remove());
            }
        }

        // garante que o CTA comece escondido
        cta.classList.remove('is-visible', 'at-end');

        // cria o ScrollTrigger que mostra e depois marca como at-end
        ScrollTrigger.create({
            trigger: section,
            start: 'top 65%',   // ajusta quando começa a aparecer
            end: 'bottom 35%',  // até quando considerar a seção ativa
            onEnter: self => {
                cta.classList.add('is-visible');
            },
            onEnterBack: self => {
                cta.classList.add('is-visible');
            },
            onLeave: self => {
                // quando sair para baixo, adiciona at-end para posicionamento final
                cta.classList.add('at-end');
            },
            onLeaveBack: self => {
                // quando voltar acima da seção, esconder
                cta.classList.remove('is-visible', 'at-end');
            }
        });
    };

    // tentar após bootAnimations (caso ScrollTrigger seja registrado lá)
    const whenReady = () => {
        trySetup();
        // também reagir a resize
        window.addEventListener('resize', () => {
            // refresh triggers se necessário
        });
    };

    // se já existe bootAnimations (iniciado) rodamos logo; senão esperamos DOMContentLoaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(whenReady, 120);
    } else {
        document.addEventListener('DOMContentLoaded', whenReady);
    }
})();


    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Aplica o tema pendente se houver, ou detecta o tema atual
    const currentTheme = window.__pendingTheme || 
                        (document.body.classList.contains('theme-aqua') ? 'aqua' : 'citrus');
    console.log(`[3D] Aplicando tema inicial no 3D: ${currentTheme}`);
    swapModel(currentTheme);
    
    // Limpa o tema pendente
    window.__pendingTheme = null;
}








function bootAnimations() {
    console.log('Iniciando reconstrução das animações...');

    // One-time guard to prevent double initialization
    if (window.__sopyBooted) return;
    window.__sopyBooted = true;

        console.log('[TEMA] Aplicando tema inicial (apenas se não houver tema)');
    if (!document.body.classList.contains('theme-aqua') && !document.body.classList.contains('theme-citrus')) {
        document.body.classList.add("theme-citrus");
    }


    // 1. Configurar Lenis (SEMPRE PRIMEIRO)
    setupLenis(); // ✅ CHAMANDO A FUNÇÃO

    // 2. Registrar plugins e eases do GSAP
    setupGsapPlugins(); // ✅ CHAMANDO A FUNÇÃO

    // 3. Ativar interatividades de UI imediatas (animações de texto serão iniciadas após seções pinned)
    setupButtonRipples(); // ✅ CHAMANDO A FUNÇÃO
    
    // 4. Configurar toggle de tema (SEMPRE EXECUTA)
    const productToggle = document.getElementById('product-toggle');
    if (productToggle) {
        console.log('[TEMA] Toggle encontrado, estado inicial checked =', productToggle.checked);
        productToggle.addEventListener('change', () => {
            const newTheme = productToggle.checked ? 'aqua' : 'citrus';
            console.log('[TEMA] Toggle change →', { checked: productToggle.checked, newTheme });
            setTheme(newTheme);
        });
        // Aplica o tema inicial baseado no estado do toggle ou body
        const initialTheme = document.body.classList.contains('theme-aqua') ? 'aqua' : 'citrus';
        setTheme(initialTheme);
    } else {
        console.warn('[TEMA] Toggle #product-toggle não encontrado!');
        // Aplica tema padrão se não houver toggle
        const initialTheme = document.body.classList.contains('theme-aqua') ? 'aqua' : 'citrus';
        setTheme(initialTheme);
    }



// =======================================================
//  ✅ BLOCO SUPER ROBUSTO PARA REVELAR O VÍDEO DA HERO
// =======================================================
const heroVideo = document.getElementById('heroVideo');
const heroPoster = document.querySelector('.sopy-hero-poster');

if (heroVideo && heroPoster) {
    const revealVideo = () => {
        // Checa se a classe já foi adicionada para não repetir a lógica
        if (!heroPoster.classList.contains('is-hidden')) {
            console.log('[HERO] Garantindo a remoção do poster.');
            heroPoster.classList.add('is-hidden');
        }
    };

    // --- TENTATIVA 1: O vídeo já está pronto? (Resolve se o script rodar depois)
    if (heroVideo.readyState >= 3) {
        revealVideo();
    } else {
    // --- TENTATIVA 2: Esperar pelo sinal do vídeo (O ideal)
        heroVideo.addEventListener('canplay', revealVideo, { once: true });
    }

    // --- TENTATIVA 3 (PLANO C - À PROVA DE FALHAS): Esperar a página inteira carregar
    // Se o evento 'canplay' falhar por algum motivo, isso garante que o poster suma.
    window.addEventListener('load', () => {
        // Adiciona um pequeno delay para garantir que a renderização da página terminou
        setTimeout(revealVideo, 250); 
    });
}


// =======================================================
//  TIRAR HEADER COM O SCROLL (ignora micro-shifts e cliques no FAQ)
// =======================================================

    // Guard de estado para evitar que o header apareça por "jump" de layout
    const headerState = {
        suppress: false,
        lastY: (window.lenis && typeof window.lenis.scroll === 'number')
            ? window.lenis.scroll
            : (window.pageYOffset || document.documentElement.scrollTop || 0)
    };

    // 1. Selecionar o header. Usar uma classe curta como '.js-head-main' é mais seguro.
    const header = document.querySelector(".js-head-main");

    if (header && typeof gsap !== 'undefined') {
        // 2. Animação que parte de fora da tela
        const showAnim = gsap.from(header, { 
            yPercent: -100,
            paused: true,
            duration: 0.4,
            ease: 'power2.out'
        }).progress(1);

        // 3. Controlar via ScrollTrigger mas com delta de scroll e supressão
        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: () => {
                const y = (window.lenis && typeof window.lenis.scroll === 'number')
                    ? window.lenis.scroll
                    : (window.pageYOffset || document.documentElement.scrollTop || 0);
                const dy = y - headerState.lastY;
                headerState.lastY = y;

                // Ignora micro mudanças de layout (ex.: expandir FAQ) e períodos suprimidos
                const THRESH = 10; // px
                if (headerState.suppress || Math.abs(dy) < THRESH) return;

                if (dy < 0) {
                    // Scroll real para cima
                    showAnim.play();
                } else if (dy > 0) {
                    // Scroll real para baixo
                    showAnim.reverse();
                }
            }
        });
    }



    // ===================================
    //  BLOCO 2: EFEITO PARALLAX (SUSTENTABILIDADE)
    // ===================================
    const parallaxContainer = document.querySelector('#sustentabilidade.scroll-container');
    if (parallaxContainer && window.lenis) { // Só executa se a seção e o Lenis existirem
        console.log('[PARALLAX] Seção #sustentabilidade encontrada. Inicializando efeito.');

        const panels = Array.from(parallaxContainer.querySelectorAll('.fullscreen-panel'));
        let viewportH = window.innerHeight;

        const setContainerHeight = () => {
            parallaxContainer.style.height = `${panels.length * 100}vh`;
        };
        setContainerHeight();

        const updateAnimation = () => {
            // ✅ PEGA O SCROLL DO LENIS, NÃO DO NAVEGADOR
            const scrollY = window.lenis.scroll;
            const rect = parallaxContainer.getBoundingClientRect();
            const containerTop = scrollY + rect.top;
            const relativeScroll = scrollY - containerTop;
            
            if (relativeScroll < 0 || relativeScroll > parallaxContainer.offsetHeight) return;

            const currentIndex = Math.floor(relativeScroll / viewportH);
            const progress = (relativeScroll % viewportH) / viewportH;
            
            const ZOOM_AMOUNT = 0.15;
            const BORDER_RADIUS_AMOUNT = 50;

            panels.forEach((panel, i) => {
                const imageWrapper = panel.querySelector('.image-wrapper');
                if (!imageWrapper) return;

                if (i === currentIndex) {
                    const scale = 1 - (progress * ZOOM_AMOUNT);
                    const br = 16 + (progress * BORDER_RADIUS_AMOUNT);
                    imageWrapper.style.transform = `scale(${scale})`;
                    imageWrapper.style.borderRadius = `${br}px`;
                } else if (i < currentIndex) {
                    imageWrapper.style.transform = `scale(${1 - ZOOM_AMOUNT})`;
                    imageWrapper.style.borderRadius = `${16 + BORDER_RADIUS_AMOUNT}px`;
                } else {
                    imageWrapper.style.transform = 'scale(1)';
                    imageWrapper.style.borderRadius = '16px';
                }
            });
        };
        
        // ✅ "ESCUTA" O EVENTO DE SCROLL DO LENIS
        window.lenis.on('scroll', updateAnimation);

        window.addEventListener('resize', () => {
            viewportH = window.innerHeight;
            setContainerHeight();
            updateAnimation();
        });

        updateAnimation(); // Roda uma vez no início
    } else {
        console.warn('[PARALLAX] Seção #sustentabilidade ou Lenis não encontrados.');
    }



    // ===================================
    //  BLOCO DO FAQ
    // ===================================
    const allAccordions = document.querySelectorAll('#faq .sopy-faq-accordion');
    console.log(`[FAQ] Encontrados ${allAccordions.length} itens de accordion.`);

    allAccordions.forEach(accordion => {
        const titleLink = accordion.querySelector('.sopy-title a');
        if (titleLink) {
            titleLink.addEventListener('click', (event) => {
                event.preventDefault();
                // Define a origem do círculo baseada na posição do clique
                try {
                    const rect = accordion.getBoundingClientRect();
                    const x = (event.clientX || rect.left + 24) - rect.left;
                    const y = (event.clientY || rect.top + rect.height/2) - rect.top;
                    accordion.style.setProperty('--circle-x', `${x}px`);
                    accordion.style.setProperty('--circle-y', `${y}px`);
                } catch(e) {}
                // Suprimir temporariamente o header para evitar aparecer por salto de layout
                try {
                    if (typeof headerState !== 'undefined' && headerState) {
                        headerState.suppress = true;
                        if (headerState.suppressTimer) clearTimeout(headerState.suppressTimer);
                        headerState.suppressTimer = setTimeout(() => {
                            headerState.suppress = false;
                        }, 500);
                    }
                } catch(e) {}
                allAccordions.forEach(acc => {
                    if (acc !== accordion && acc.classList.contains('open')) {
                        acc.classList.remove('open');
                    }
                });
                accordion.classList.toggle('open');
            });
        }
    });

    // ===================================
    //  INICIALIZAÇÃO DA IMAGEM DO CARD
    // ===================================
    function initCardImage() {
        try {
            const sopyCardImage = document.querySelector('.sopy-card-image');
            if (sopyCardImage) {
                const currentTheme = document.body.classList.contains('theme-aqua') ? 'aqua' : 'citrus';
                const correctSrc = currentTheme === 'citrus' 
                    ? sopyCardImage.getAttribute('data-citrus')
                    : sopyCardImage.getAttribute('data-aqua');
                
                if (correctSrc && !sopyCardImage.src.includes(correctSrc.split('/').pop())) {
                    console.log(`[BENEFÍCIOS] Definindo imagem inicial para tema ${currentTheme}:`, correctSrc);
                    sopyCardImage.src = correctSrc;
                }
            }
        } catch (e) {
            console.warn('[BENEFÍCIOS] Erro ao inicializar imagem do card:', e);
        }
    }

    // ===================================
    //  BLOCO DOS BENEFÍCIOS - CLEAN SLATE ANIMATION (COM PIN CONTROLADO)
    // ===================================
    function initBenefitsAnimations(){
        // Verificação de dependências
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        
        console.log('[BENEFÍCIOS] Inicializando Clean Slate Animation (com pin controlado)...');
        
        // Inicializa a imagem correta baseada no tema atual
        initCardImage();
        
        const cleanSlateTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#clean-slate-section",
                pin: true,
                scrub: 1.2,
                start: "top top",
                end: "+=1200"
            }
        });

        cleanSlateTimeline
            .to(".green-wave", { 
                transform: "translate(-50%, -50%) translateX(0%)", 
                ease: "none"
            })
            .to(".card-old-way", {
                opacity: 0,
                scale: 0.9,
                ease: "power1.in"
            }, "<0.2")
            .to(".card-sopy-way", {
                opacity: 1,
                ease: "power2.out"
            }, ">-0.5")
            // EXATAMENTE igual ao teste.html
            .to({}, { duration: 1 });

        console.log('[BENEFÍCIOS] Clean Slate Timeline (com pin controlado) configurada com sucesso!');
    }


    // ===================================
    //  BLOCO COMO USAR (Slider estilo referência, animado pelo scroll)
    // ===================================

    (function initComoUsar(){
        const howSection = document.querySelector('.sopy-how-section.how-fullscreen');
        if (!howSection) return;
        const track = howSection.querySelector('.how-slides-track');
        const slides = track ? Array.from(track.querySelectorAll('.how-slide')) : [];
        const textEl = howSection.querySelector('#how-text');
        const navEl = howSection.querySelector('#how-nav');
    const nextBtn = howSection.querySelector('#how-next');
    if (!track || !slides.length || !navEl || !textEl || !slides) return;

        // Dados dos slides com títulos e textos de apoio
        const slideData = [
            {
                label: '01 Passo',
                title: '01. DOSE ÚNICA, SEM MEDIÇÃO',
                support: 'Sem medir, sem sujar. Apenas pegue uma cápsula Sopy para cargas normais, ou duas para lavagens extra grandes e muito sujas. Simples assim.'
            },
            {
                label: '02 Passo', 
                title: '02. DIRETO NO TAMBOR, ANTES DAS ROUPAS',
                support: 'Nada de gavetas ou medidores. Jogue a cápsula diretamente no fundo do tambor da sua máquina de lavar, antes de adicionar as roupas. Praticidade total.'
            },
            {
                label: '03 Passo',
                title: '03. APENAS APERTE O START', 
                support: 'Agora é só colocar suas roupas e iniciar seu ciclo de lavagem preferido. Água fria, quente, ciclo rápido... a película 100% solúvel e a fórmula inteligente da Sopy cuidam de tudo.'
            },
            {
                label: '04 Resultado',
                title: '04. RESULTADO IMPECÁVEL',
                support: 'Sinta a maciez que abraça cada fibra, respire o perfume duradouro que permanece por dias, e desfrute da confiança de roupas impecavelmente limpas. Sopy oferece muito mais que limpeza: é puro conforto.'
            }
        ];

        // Nav items com labels personalizados
        navEl.innerHTML = '';
        slideData.slice(0, slides.length).forEach((data, i) => {
            const item = document.createElement('div');
            item.className = 'how-nav-item';
            item.setAttribute('data-index', i);
            item.innerHTML = `<span>${data.label}</span><div class="how-nav-bar"></div>`;
            navEl.appendChild(item);
        });
        const navItems = Array.from(navEl.querySelectorAll('.how-nav-item'));

        // Setup inicial - apenas configurações básicas de CSS aqui
        slides.forEach((s, i) => {
            s.style.position = 'absolute';
            s.style.top = '0';
            s.style.left = '0';
            s.style.width = '100%';
            s.style.height = '100vh';
            
            // Debug: verificar qual imagem está sendo aplicada
            const bgImage = getComputedStyle(s).backgroundImage;
            const slideNum = s.getAttribute('data-slide');
            console.log(`[SLIDE INDEX ${i}, DATA-SLIDE ${slideNum}] BgImage: ${bgImage}`);
        });

        // Criar dots de progresso (igual aos depoimentos)
        let howProgressWrap = howSection.querySelector('.sopy-how-progress');
        if (!howProgressWrap) {
            howProgressWrap = document.createElement('div');
            howProgressWrap.className = 'sopy-how-progress visible';
            howProgressWrap.style.cssText = `
                position: absolute;
                left: 50%;
                bottom: 40px;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 14px;
                z-index: 50;
                opacity: 1;
                pointer-events: auto;
            `;
            howSection.appendChild(howProgressWrap);
        }

        // Criar dots dinâmicos
        howProgressWrap.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'sopy-how-progress-dot';
            dot.setAttribute('data-index', i);
            howProgressWrap.appendChild(dot);
        });

        const howDots = howProgressWrap.querySelectorAll('.sopy-how-progress-dot');
    navItems[0]?.classList.add('active');
    textEl.textContent = slideData[0].title;
    if (nextBtn) { nextBtn.setAttribute('aria-label', 'Próximo slide'); nextBtn.innerHTML = '<span></span>'; }

        // Referência ao elemento de texto de apoio
        const supportTextEl = howSection.querySelector('#how-text-support');
        let lastIdx = -1;
        const applyActive = (idx) => {
            if (idx === lastIdx) return;
            lastIdx = idx;
            navItems.forEach((n, i) => n.classList.toggle('active', i === idx));
            // Atualizar dots também
            howDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
            
            const currentSlide = slideData[idx] || slideData[0];
            
            if (textEl) {
                textEl.style.transition = 'opacity .45s, transform .45s';
                textEl.style.opacity = '0';
                setTimeout(() => {
                    textEl.textContent = currentSlide.title;
                    textEl.style.transform = 'translateY(50px)';
                    requestAnimationFrame(() => {
                        textEl.style.opacity = '1';
                        textEl.style.transform = 'translateY(0)';
                    });
                }, 150);
            }
            
            if (supportTextEl) {
                supportTextEl.style.transition = 'opacity .45s, transform .45s';
                supportTextEl.style.opacity = '0';
                setTimeout(() => {
                    supportTextEl.textContent = currentSlide.support;
                    supportTextEl.style.transform = 'translateY(50px)';
                    requestAnimationFrame(() => {
                        supportTextEl.style.opacity = '1';
                        supportTextEl.style.transform = 'translateY(0)';
                    });
                }, 200); // Ligeiramente atrasado para efeito escalonado
            }
        };

        const isMobile = window.matchMedia('(max-width: 900px)').matches;
        if (isMobile) {
            howSection.classList.add('mobile-swipe');
        } else {
            howSection.classList.remove('mobile-swipe');
        }

        if (isMobile || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // Mobile: touch/drag slider left/right
            let currentIndex = 0;
            let isAnimating = false;
            let isDragging = false;
            let startX = 0;
            let deltaX = 0;

            const slideTo = (targetIndex) => {
                if (isAnimating) return;
                if (targetIndex >= slides.length) targetIndex = 0;
                if (targetIndex < 0) targetIndex = slides.length - 1;
                if (targetIndex === currentIndex) return;
                
                console.log(`[SLIDE TO] De ${currentIndex} para ${targetIndex}`);
                
                isAnimating = true;
                const direction = targetIndex > currentIndex || (currentIndex === slides.length - 1 && targetIndex === 0) ? 1 : -1;
                const currentSlide = slides[currentIndex];
                const nextSlide = slides[targetIndex];

                console.log(`[SLIDE TO] Current slide:`, currentSlide.getAttribute('data-slide'));
                console.log(`[SLIDE TO] Next slide:`, nextSlide.getAttribute('data-slide'));

                // Sanitizar: garantir que todos os outros slides estejam fora da tela à direita
                slides.forEach((s, i) => {
                    if (i !== currentIndex && i !== targetIndex) {
                        gsap.set(s, { x: '100%', zIndex: 0, opacity: 1 });
                    }
                });

                // Zerar x (px) para evitar conflito com xPercent
                gsap.set([currentSlide, nextSlide], { x: 0 });

                // Primeiro, posicionar o próximo slide em xPercent e z-index correto
                gsap.set(nextSlide, { xPercent: direction * 100, opacity: 1, zIndex: 2, visibility: 'visible' });
                gsap.set(currentSlide, { zIndex: 1 });

                const tl = gsap.timeline({
                    defaults: { duration: 0.5, ease: 'power2.inOut' },
                    onComplete: () => {
                        currentIndex = targetIndex;
                        isAnimating = false;
                        applyActive(currentIndex);
                        console.log(`[SLIDE TO] Animação completa, currentIndex agora é: ${currentIndex}`);
                    }
                });

                // Importante: mover o slide atual para fora e trazer o próximo para 0%
                                                tl.to(currentSlide, { xPercent: direction * -100 }, 0)
                                                    .to(nextSlide, { xPercent: 0 }, 0)
                                      .add(() => {
                                            // Após a animação: garantir que somente o slide atual esteja por cima
                                          slides.forEach((s, i) => gsap.set(s, { zIndex: i === targetIndex ? 2 : 0, x: 0, xPercent: i === targetIndex ? 0 : 100, visibility: i === targetIndex ? 'visible' : 'hidden' }));
                                    });
            };

            const handleStart = (e) => {
                if (isAnimating) return;
                isDragging = true;
                startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                deltaX = 0;
                track.classList.add('is-grabbing');
            };
            const handleMove = (e) => {
                if (!isDragging) return;
                if (e.cancelable) e.preventDefault(); // impede scroll vertical durante o swipe
                const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                deltaX = currentX - startX;
                
                // Efeito "divisão" como no desktop: mostrar próximo slide durante o drag
                const currentSlide = slides[currentIndex];
                let nextSlide;
                
                if (deltaX > 0) {
                    // Arrastando para direita (slide anterior)
                    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
                    nextSlide = slides[prevIndex];
                    // Posicionar slide anterior à esquerda e tornar visível
                    gsap.set(nextSlide, { xPercent: -100, visibility: 'visible', zIndex: 1 });
                    // Mover ambos para direita
                    gsap.set(currentSlide, { x: deltaX, zIndex: 2 });
                    gsap.set(nextSlide, { x: deltaX });
                } else if (deltaX < 0) {
                    // Arrastando para esquerda (próximo slide)
                    const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
                    nextSlide = slides[nextIndex];
                    // Posicionar próximo slide à direita e tornar visível
                    gsap.set(nextSlide, { xPercent: 100, visibility: 'visible', zIndex: 1 });
                    // Mover ambos para esquerda
                    gsap.set(currentSlide, { x: deltaX, zIndex: 2 });
                    gsap.set(nextSlide, { x: deltaX });
                } else {
                    // deltaX = 0, apenas mover o slide atual
                    gsap.set(currentSlide, { x: deltaX });
                }
            };
            const handleEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                track.classList.remove('is-grabbing');
                const threshold = howSection.offsetWidth * 0.2;
                if (Math.abs(deltaX) > threshold) {
                    const direction = deltaX > 0 ? -1 : 1;
                    slideTo(currentIndex + direction);
                } else {
                    // Voltar ao estado original - esconder slides que ficaram visíveis durante drag
                    gsap.to(slides[currentIndex], { x: 0, duration: 0.3 });
                    slides.forEach((slide, i) => {
                        if (i !== currentIndex) {
                            gsap.set(slide, { visibility: 'hidden', x: 0 });
                        }
                    });
                }
            };

            // Listeners
            track.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            track.addEventListener('touchstart', handleStart, { passive: false });
            track.addEventListener('touchmove', handleMove, { passive: false });
            track.addEventListener('touchend', handleEnd);

            // Nav clicks
            navItems.forEach((item, i) => item.addEventListener('click', () => slideTo(i)));
            nextBtn?.addEventListener('click', () => slideTo(currentIndex + 1));
            
            // Dots clicks
            howDots.forEach((dot, i) => dot.addEventListener('click', () => slideTo(i)));

            // Setup inicial dos slides para MOBILE (horizontal swipe)
            slides.forEach((slide, index) => {
                if (index === 0) {
                    gsap.set(slide, { xPercent: 0, x: 0, opacity: 1, zIndex: 2, visibility: 'visible' });
                } else {
                    gsap.set(slide, { xPercent: 100, x: 0, opacity: 1, zIndex: 1, visibility: 'hidden' });
                }
                
                console.log(`[MOBILE SETUP SLIDE ${index}] xPercent=${index === 0 ? 0 : 100}, opacity=1, zIndex=${index === 0 ? 2 : 1}`);
            });

            // Initial
            applyActive(0);
        } else {
            // Desktop: ScrollTrigger pin + scrub timeline
            const tl = gsap.timeline({ paused: true });
            // Evitar gap/preto durante o scrub: leve overlap e slide entrando por cima
            slides.forEach((slide, i) => {
                if (i === 0) return;
                const prev = slides[i - 1];
                tl.addLabel(`slide${i}`)
                  // Garante que o próximo slide fique por cima durante a transição
                  .set(slide, { zIndex: 3 }, `slide${i}`)
                  // Leve overlap para evitar linha/preto por arredondamento durante drag
                  .to(prev, { xPercent: -100.2, duration: 1, ease: 'none' }, `slide${i}`)
                  .fromTo(slide, { xPercent: 100 }, { xPercent: -0.2, duration: 1, ease: 'none' }, `slide${i}`)
                  // Normaliza posição ao final do trecho para manter layout consistente
                  .set(slide, { xPercent: 0 }, ">")
                  .set(prev, { zIndex: 1 }, ">");
            });

            const totalDur = slides.length - 1;

            const howTrigger = ScrollTrigger.create({
                id: 'how-scroll',
                trigger: howSection,
                start: 'top top',
                end: () => `+=${window.innerHeight * totalDur}`,
                pin: true,
                // Scrub direto (sem smoothing) para manter os dois tweens sincronizados no drag
                scrub: true,
                invalidateOnRefresh: true,
                onEnter: () => applyActive(0),
                onEnterBack: (self) => {
                    const idx = Math.round(self.progress * (slides.length - 1));
                    applyActive(idx);
                },
                onLeaveBack: () => applyActive(0),
                onUpdate: (self) => {
                    tl.progress(self.progress);
                    const idx = Math.round(self.progress * (slides.length - 1));
                    applyActive(idx);
                }
            });

            // Nav scroll to slide
            const scrollToSlide = (index) => {
                const st = ScrollTrigger.getById ? ScrollTrigger.getById('how-scroll') : null;
                const duration = 0.8;
                if (!st) return;
                const start = st.start;
                const total = (slides.length - 1) * window.innerHeight;
                const yTarget = Math.round(start + (total * (index / (slides.length - 1))));
                if (window.lenis && typeof window.lenis.scrollTo === 'function') {
                    window.lenis.scrollTo(yTarget, { duration, easing: t => 1 - Math.pow(1 - t, 3) });
                } else {
                    window.scrollTo({ top: yTarget, behavior: 'smooth' });
                }
            };
            navItems.forEach((item, i) => item.addEventListener('click', () => scrollToSlide(i)));
            nextBtn?.addEventListener('click', () => {
                const cur = Math.round(tl.progress() * (slides.length - 1));
                const next = Math.min(slides.length - 1, cur + 1);
                scrollToSlide(next);
            });
            
            // Dots clicks
            howDots.forEach((dot, i) => dot.addEventListener('click', () => scrollToSlide(i)));

            // Setup inicial dos slides para DESKTOP (ScrollTrigger scrub)
            slides.forEach((slide, index) => {
                if (index === 0) {
                    gsap.set(slide, { xPercent: 0, opacity: 1, zIndex: 2 });
                } else {
                    gsap.set(slide, { xPercent: 100, opacity: 1, zIndex: 1 });
                }
                
                console.log(`[DESKTOP SETUP SLIDE ${index}] xPercent=${index === 0 ? 0 : 100}, opacity=1, zIndex=${index === 0 ? 2 : 1}`);
            });

            applyActive(0);

            window.addEventListener('resize', () => { try { ScrollTrigger.refresh(); } catch(e){} });
        }
    })();

    // --- Parte 2: Lógica para a Barra de Progresso Global ---
    // Atualiza tanto a barra linear quanto o círculo (se existirem), usando Lenis quando disponível
    const pageBar = document.querySelector('.page-progress-bar');
    const pageCirc = document.querySelector('.progress-circle-bar');
    if (pageBar || pageCirc) {
        const CIRCUMFERENCE = 2 * Math.PI * 45; // raio 45 do SVG
        const updatePageProgress = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const y = (window.lenis && typeof window.lenis.scroll === 'number') ? window.lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop || 0);
            const p = docHeight > 0 ? Math.max(0, Math.min(1, y / docHeight)) : 0;
            if (pageBar) pageBar.style.transform = `scaleX(${p})`;
            if (pageCirc) pageCirc.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - p)}`;
        };
        try { if (window.lenis) window.lenis.on('scroll', updatePageProgress); } catch(e){}
        window.addEventListener('resize', updatePageProgress);
        // init
        updatePageProgress();
    }

   // ===================================
    //  BLOCO DOS DEPOIMENTOS 
    // ===================================
    const testimonialsSection = document.getElementById('testemunhos');
    if (testimonialsSection) {
        console.log('[DEPOIMENTOS] Seção encontrada. Inicializando slider...');

        const track = testimonialsSection.querySelector('.tc-testimonials-track');
        const cards = track ? Array.from(track.querySelectorAll('.tc-testimonial-card')) : [];

        // Criar progress wrap dentro da própria seção (para evitar aparecer em outras seções)
        // e seguir o mesmo comportamento de visibilidade do Como Usar (.visible)
        let tcProgressWrap = testimonialsSection.querySelector('.tc-progress-wrap');
        if (!tcProgressWrap) {
            tcProgressWrap = document.createElement('div');
            tcProgressWrap.className = 'tc-progress-wrap';
            // Prefer append inside the right column so the dots center under the cards
            const rightCol = testimonialsSection.querySelector('.tc-right');
            if (rightCol) {
                rightCol.appendChild(tcProgressWrap);
            } else {
                // fallback: append to section
                testimonialsSection.appendChild(tcProgressWrap);
            }
        }

        // Limpa e cria dots dinâmicos dentro do wrap da seção
        tcProgressWrap.innerHTML = '';
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'tc-progress-dot';
            dot.setAttribute('data-index', i);
            tcProgressWrap.appendChild(dot);
        });

        const dots = tcProgressWrap.querySelectorAll('.tc-progress-dot');

        // Populate avatar images (if placeholders exist) with public images
        try {
            const avatarUrls = [
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format&q=60',
                'https://images.unsplash.com/photo-1545996124-1b3b0a1b6f3d?w=200&h=200&fit=crop&auto=format&q=60',
                'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&auto=format&q=60',
                'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&h=200&fit=crop&auto=format&q=60',
                'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=200&fit=crop&auto=format&q=60'
            ];
            const avatars = testimonialsSection.querySelectorAll('img.tc-avatar');
            avatars.forEach((img, i) => {
                const url = avatarUrls[i % avatarUrls.length];
                if (img && !img.getAttribute('src')) img.setAttribute('src', url);
            });
        } catch (e) {
            console.warn('[DEPOIMENTOS] Falha ao popular avatares:', e);
        }

        if (track && cards.length > 0) {
            let currentIndex = 0;
            let isAnimating = false;
            let autoInterval;

            // Selecionar botões de navegação
            const btnNext = testimonialsSection.querySelector('.tc-nav-next');
            const btnPrev = testimonialsSection.querySelector('.tc-nav-prev');

            const slideTo = (targetIndex) => {
                if (isAnimating) return;
                
                // Carrossel infinito
                if (targetIndex >= cards.length) targetIndex = 0;
                if (targetIndex < 0) targetIndex = cards.length - 1;
                
                if (targetIndex === currentIndex) return;

                isAnimating = true;
                clearInterval(autoInterval);

                const currentCard = cards[currentIndex];
                const nextCard = cards[targetIndex];
                const direction = targetIndex > currentIndex || (currentIndex === cards.length - 1 && targetIndex === 0) ? 1 : -1;

                // Animação horizontal igual ao Como Usar
                gsap.timeline({
                    defaults: { duration: 0.2, ease: 'power2.out' },
                    onComplete: () => {
                        currentIndex = targetIndex;
                        isAnimating = false;
                        startAutoPlay();
                        updateDots();
                    }
                })
                .to(currentCard, { x: direction * -100 + '%', opacity: 0 }, 0)
                .fromTo(nextCard, 
                    { x: direction * 100 + '%', opacity: 0 },
                    { x: '0%', opacity: 1 }, 0.1
                );
            };

            const updateDots = () => {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            };

            const startAutoPlay = () => {
                clearInterval(autoInterval);
                autoInterval = setInterval(() => {
                    slideTo(currentIndex + 1); // Infinito
                }, 6000);
            };

            // Drag/Touch igual ao Como Usar
            let isDragging = false;
            let startX = 0;
            let deltaX = 0;

            const handleStart = (e) => {
                if (isAnimating) return;
                isDragging = true;
                startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                deltaX = 0;
                track.classList.add('tc-grabbing');
                clearInterval(autoInterval);
            };

            const handleMove = (e) => {
                if (!isDragging) return;
                const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                deltaX = currentX - startX;
                gsap.set(cards[currentIndex], { x: deltaX });
            };

            const handleEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                track.classList.remove('tc-grabbing');
                
                const threshold = track.offsetWidth * 0.2;
                if (Math.abs(deltaX) > threshold) {
                    const direction = deltaX > 0 ? -1 : 1;
                    slideTo(currentIndex + direction);
                } else {
                    gsap.to(cards[currentIndex], { x: 0, duration: 0.3 });
                    startAutoPlay();
                }
            };

            // Event listeners
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => slideTo(index));
            });

            // Event listeners para os botões de navegação
            if (btnNext) {
                btnNext.addEventListener('click', () => {
                    slideTo(currentIndex + 1);
                });
            }
            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    slideTo(currentIndex - 1);
                });
            }
            
            track.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            track.addEventListener('touchstart', handleStart, { passive: false });
            track.addEventListener('touchmove', handleMove, { passive: false });
            track.addEventListener('touchend', handleEnd);

            // Setup inicial
            cards.forEach((card, index) => {
                if (index === 0) {
                    gsap.set(card, { x: 0, opacity: 1 });
                } else {
                    gsap.set(card, { x: '100%', opacity: 0 });
                }
            });
            
            updateDots();
            startAutoPlay();
            
            // Dots sempre visíveis 100% do tempo
            tcProgressWrap.classList.add('visible');
            // Força estilo inline para garantir que nunca suma
            tcProgressWrap.style.opacity = '1';
            tcProgressWrap.style.pointerEvents = 'auto';

        } else {
            console.warn('[DEPOIMENTOS] Elementos do slider (.tc-testimonials-track ou .tc-testimonial-card) não encontrados.');
        }
    } else {
        console.log('[DEPOIMENTOS] Seção #testemunhos não encontrada.');
    }

      // 3. Inicializador do 3D (Lazy Load)
    const threeSection = document.getElementById("capsula-3d");
    if (threeSection) {
        new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                initThree();
                observer.unobserve(threeSection);
            }
        }, { threshold: 0.1 }).observe(threeSection);
    }

    // ===================================
    //  BLOCO COMO USAR (Horizontal Scroll com efeito Flickity)
    // ===================================
    const comoUsarSection = document.querySelector('.sopy-how-section');
    if (comoUsarSection && !comoUsarSection.classList.contains('how-fullscreen')) {
        console.log('[COMO USAR] Seção encontrada. Inicializando efeito Flickity...');
        
        const track = comoUsarSection.querySelector('.sopy-how-track');
        const panels = track ? Array.from(track.querySelectorAll('.sopy-how-panel')) : [];
        const progressDots = comoUsarSection.querySelectorAll('.sopy-how-progress-dot');
        
        if (track && panels.length > 0 && typeof ScrollTrigger !== 'undefined') {
            
            // Função para atualizar qual card está ativo baseado no progresso
            const updateActiveCard = (progress) => {
                // Calcula qual painel deve estar ativo baseado no progresso (0-1)
                const totalPanels = panels.length;
                const currentFloat = progress * (totalPanels - 1);
                const activeIndex = Math.round(currentFloat);
                
                // Sistema de proximidade suave para blur/opacity
                panels.forEach((panel, index) => {
                    const distance = Math.abs(index - currentFloat);
                    const isActive = distance < 0.5;
                    
                    // Aplica classe is-selected baseado na proximidade
                    if (isActive) {
                        panel.classList.add('is-selected');
                    } else {
                        panel.classList.remove('is-selected');
                    }
                });
                
                // Atualiza dots de progresso (só o mais próximo fica ativo)
                progressDots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            };
            
            // Aplica estado inicial (primeiro card ativo)
            updateActiveCard(0);
            
            // ScrollTrigger para animar o scroll horizontal e controlar qual card está ativo
            ScrollTrigger.create({
                trigger: comoUsarSection,
                start: 'top top',
                end: 'bottom bottom',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Move o track horizontalmente
                    const progress = self.progress;
                    const moveDistance = -(panels.length - 1) * 100; // Move 100% * (num panels - 1)
                    gsap.set(track, { 
                        xPercent: progress * moveDistance 
                    });
                    
                    // Atualiza qual card está ativo
                    updateActiveCard(progress);
                },
                onEnter: () => {
                    // Mostra progress dots quando entra na seção
                    const progressEl = comoUsarSection.querySelector('.sopy-how-progress');
                    if (progressEl) {
                        progressEl.classList.add('visible');
                    }
                },
                onLeave: () => {
                    // Esconde progress dots quando sai da seção
                    const progressEl = comoUsarSection.querySelector('.sopy-how-progress');
                    if (progressEl) {
                        progressEl.classList.remove('visible');
                    }
                },
                onEnterBack: () => {
                    const progressEl = comoUsarSection.querySelector('.sopy-how-progress');
                    if (progressEl) {
                        progressEl.classList.add('visible');
                    }
                },
                onLeaveBack: () => {
                    const progressEl = comoUsarSection.querySelector('.sopy-how-progress');
                    if (progressEl) {
                        progressEl.classList.remove('visible');
                    }
                }
            });
        } else {
            console.warn('[COMO USAR] Elementos necessários não encontrados ou ScrollTrigger não disponível.');
        }
    } else {
        console.log('[COMO USAR] Seção horizontal não encontrada.');
    }

    // 4. Após montar seções com pin, iniciamos reveals e benefícios, depois refresh geral
    try {
        initBenefitsAnimations();
        initTextAnimations();
    } catch(e) { console.error('[BOOT] Erro ao iniciar reveals:', e); }

    setTimeout(() => {
        if (window.ScrollTrigger) {
            console.log('✅ Forçando refresh final do ScrollTrigger.');
            ScrollTrigger.refresh();
        }
    }, 200);

    
    
} // Fim da função bootAnimations

// Observação: a inicialização automática foi removida para permitir que o host controle

// ========== SLIDER FULLSCREEN ==========
(function() {
  "use strict";

  /* refs */
  const track = document.querySelector(".slider-slide");
  const btnNext = document.querySelector(".slider-next");
  const btnPrev = document.querySelector(".slider-prev");
  const btnContainer = document.querySelector(".slider-button");
  const section = document.querySelector(".slider-fullscreen-section");

  if (!track || !btnNext || !btnPrev || !section || !btnContainer) {
    console.warn('[SLIDER] Elementos não encontrados');
    return;
  }

  let currentIndex = 0;
  const totalSlides = track.querySelectorAll(".slider-item").length;
  let isTransitioning = false;

  /* Atualiza classe do último slide */
  function updateLastSlideClass() {
    if (currentIndex === totalSlides - 1) {
      track.classList.add('last-slide');
    } else {
      track.classList.remove('last-slide');
    }
  }

  /* ações */
  function toNext() {
    if (isTransitioning) return;
    const items = track.querySelectorAll(".slider-item");
    if (items.length && currentIndex < totalSlides - 1) {
      isTransitioning = true;
      track.appendChild(items[0]);
      currentIndex++;
      updateLastSlideClass();
      setTimeout(() => isTransitioning = false, 500);
    }
  }
  
  function toPrev() {
    if (isTransitioning) return;
    const items = track.querySelectorAll(".slider-item");
    if (items.length && currentIndex > 0) {
      isTransitioning = true;
      track.prepend(items[items.length - 1]);
      currentIndex--;
      updateLastSlideClass();
      setTimeout(() => isTransitioning = false, 500);
    }
  }

  /* BOTÕES */
  btnNext.addEventListener("click", toNext);
  btnPrev.addEventListener("click", toPrev);

  /* VISIBILIDADE DOS BOTÕES - apenas quando na seção */
  function updateButtonsVisibility() {
    const rect = section.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
    
    if (isInView) {
      btnContainer.style.opacity = '1';
      btnContainer.style.pointerEvents = 'auto';
    } else {
      btnContainer.style.opacity = '0';
      btnContainer.style.pointerEvents = 'none';
    }
  }

  /* SCROLL PROGRESS - sistema melhorado */
  let lastKnownIndex = 0;
  let ticking = false;
  
  function updateSlideByScroll() {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Só atua quando a seção está na viewport
    if (sectionTop > viewportHeight || rect.bottom < 0) {
      ticking = false;
      return;
    }
    
    // Total "scrollable" enquanto a seção fica pinada = sectionHeight - viewport
    const totalScrollable = Math.max(sectionHeight - viewportHeight, 1);
    
    // Progresso normalizado (0..1)
    // quando rect.top == 0 -> início (progress 0)
    // quando rect.top == -totalScrollable -> fim (progress 1)
    const scrolled = -Math.min(Math.max(sectionTop, -totalScrollable), 0);
    const progress = scrolled / totalScrollable;
    
    // LOGS DETALHADOS
    console.log('📊 SLIDER DEBUG:', {
      progress: (progress * 100).toFixed(1) + '%',
      currentIndex: currentIndex,
      sectionTop: sectionTop.toFixed(0) + 'px',
      sectionHeight: sectionHeight + 'px',
      viewportHeight: viewportHeight + 'px',
      totalScrollable: totalScrollable + 'px',
      scrolled: scrolled.toFixed(0) + 'px'
    });
    
    // Pesos por slide (soma = 1.0)
    // Ajuste esses valores para controlar quanto cada slide ocupa
    const slideWeights = [0.32, 0.28, 0.25, 0.15]; // 32%, 28%, 25%, 15%
    
    // Calcula o índice baseado nos pesos
    let targetIndex = 0;
    let accumulated = 0;
    for (let i = 0; i < slideWeights.length; i++) {
      accumulated += slideWeights[i];
      if (progress < accumulated) {
        targetIndex = i;
        break;
      }
      if (i === slideWeights.length - 1) {
        targetIndex = i;
      }
    }
    
    console.log('🎯 Target Index:', targetIndex, '| Last Known:', lastKnownIndex);
    
    // Só muda se passou para outro índice
    if (targetIndex !== lastKnownIndex && !isTransitioning) {
      const diff = targetIndex - lastKnownIndex;
      
      console.log('🔄 Mudando slide! Diff:', diff);
      
      if (diff > 0) {
        // Avançar
        for (let i = 0; i < diff; i++) {
          toNext();
        }
      } else if (diff < 0) {
        // Voltar
        for (let i = 0; i < Math.abs(diff); i++) {
          toPrev();
        }
      }
      
      lastKnownIndex = targetIndex;
    }
    
    ticking = false;
  }
  
  // Usa requestAnimationFrame para melhor performance
  window.addEventListener("scroll", () => {
    updateButtonsVisibility();
    
    if (!ticking) {
      window.requestAnimationFrame(updateSlideByScroll);
      ticking = true;
    }
  }, { passive: true });

  /* WHEEL - navegação alternativa por wheel */
  let wheelTimeout;
  let wheelDelta = 0;
  
  function onWheel(e) {
    const rect = section.getBoundingClientRect();
    const isInView = rect.top <= 50 && rect.bottom >= window.innerHeight - 50;
    
    if (!isInView) return;
    
    clearTimeout(wheelTimeout);
    wheelDelta += e.deltaY;
    
    wheelTimeout = setTimeout(() => {
      if (Math.abs(wheelDelta) > 50) {
        if (wheelDelta > 0 && currentIndex < totalSlides - 1) {
          toNext();
        } else if (wheelDelta < 0 && currentIndex > 0) {
          toPrev();
        }
      }
      wheelDelta = 0;
    }, 100);
  }
  
  window.addEventListener("wheel", onWheel, { passive: true });

  /* TECLADO */
  window.addEventListener("keydown", (e) => {
    const rect = section.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isInView) return;
    
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown") {
      e.preventDefault();
      toNext();
    }
    if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") {
      e.preventDefault();
      toPrev();
    }
  });

  /* TOUCH */
  let touchStartX = 0, touchStartY = 0, touchActive = false;
  const SWIPE_THRESHOLD = 50;
  
  window.addEventListener("touchstart", (e) => {
    const rect = section.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isInView) return;
    
    if (e.touches.length !== 1) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (!touchActive) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    touchActive = false;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) toNext(); else toPrev();
    } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
      if (dy < 0) toNext(); else toPrev();
    }
  }, { passive: true });

  // Inicializa visibilidade dos botões
  updateButtonsVisibility();
  
  // Inicializa classe do último slide
  updateLastSlideClass();

})();

// explicitamente quando chamar bootAnimations(). Isso evita conflitos de múltiplos boots.