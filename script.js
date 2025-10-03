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
    document.querySelectorAll('.sopy-btn').forEach(btn => {
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
    console.log(`[3D] Trocando para o modelo: ${theme}`);
    if (!THREE_READY || !capsuleGroup) return;

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
    
    // ... (seu código para atualizar textos do card de produto) ...

    swapModel(theme);
}

function initThree() {
    const threeWrap = document.getElementById("three-container");
    if (!THREE_READY || !threeWrap || threeWrap.__initialized) return;
    threeWrap.__initialized = true;

    console.log("[3D] Inicializando cena Three.js...");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, threeWrap.clientWidth / threeWrap.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.2);

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

   /* ====== Spin + Descida até o MEIO da seção (usando teu setup antigo) ====== */
/* Substitua SÓ o teu IIFE `setupCapsuleSpinOnScroll` por este aqui.          */

/* ====== Spin + Descida até o MEIO da seção (forçando antes do render) ====== */
/* Cole no lugar do seu setupCapsuleSpinOnScroll antigo.                        */

(function setupCapsuleSpinOnScroll(){
  const spinSection = document.getElementById('capsula-3d');
  if (!spinSection || typeof capsuleGroup === 'undefined' || !capsuleGroup || !renderer) return;

  // -------- parâmetros de controle (ajuste livre) --------
    // Você pode sobrescrever estes valores via data-attributes no elemento #capsula-3d
    // Ex.: <section id="capsula-3d" data-drop-end="0.55" data-y-end="-0.25" ...>
    const ds = spinSection.dataset || {};
    const toNum = (v, fb) => {
        const s = v == null ? '' : String(v).trim();
        const n = parseFloat(s);
        return Number.isFinite(n) ? n : fb;
    };
    const DROP_END   = toNum(ds.dropEnd, 0.50);  // até onde o objeto DESCE (0..1 do progresso da seção) — pára no meio
    const SPIN_START = toNum(ds.spinStart, 0.05); // começa a girar
    const SPIN_END   = toNum(ds.spinEnd, 0.65);   // termina o giro (360°) e fica reto

    // alturas em coordenadas do mundo 3D
    const Y_START = toNum(ds.yStart, 5.0);        // começa alto (visível)
    const Y_END   = toNum(ds.yEnd, -10.15);        // posição final no MEIO da seção

  const TWO_PI = Math.PI * 2;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ease    = t => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t)); // easeInOutSine

  // estado inicial: visível e reto
  const BASE_YAW = capsuleGroup.rotation?.y || 0;
  capsuleGroup.position.y = Y_START;
  if (capsuleGroup.rotation) capsuleGroup.rotation.set(0, BASE_YAW, 0);

  // cache de métricas
  let sectionTop = 0, sectionH = 0, vh = window.innerHeight;
  function recalc(){
    const r = spinSection.getBoundingClientRect();
    sectionTop = (window.scrollY || window.pageYOffset || 0) + r.top;
    sectionH   = r.height;
    vh         = window.innerHeight;
  }
  recalc();

  // progresso 0..1 da seção atravessando a viewport (sem pin)
  function progress(){
    const y = window.scrollY || window.pageYOffset || 0;
    const total = sectionH + vh;
    const seen  = (vh + y) - sectionTop;
    return clamp01(seen / total);
  }

  // aplica posição + rotação com base no scroll
  function syncFromScroll(){
    const p = progress();

    // DESCIDA: para de descer em DROP_END (meio da seção)
    const tDrop = p <= 0 ? 0 : (p >= DROP_END ? 1 : (p / DROP_END));
    capsuleGroup.position.y = Y_START + (Y_END - Y_START) * ease(tDrop);

    // SPIN: 360° apenas entre SPIN_START..SPIN_END; fora disso, travado reto
    if (p <= SPIN_START) {
      capsuleGroup.rotation.y = BASE_YAW;
    } else if (p >= SPIN_END) {
      capsuleGroup.rotation.y = BASE_YAW + TWO_PI;
    } else {
      const tSpin = (p - SPIN_START) / (SPIN_END - SPIN_START);
      capsuleGroup.rotation.y = BASE_YAW + tSpin * TWO_PI;
    }
  }

    // força nossa sincronização ANTES de cada render (ganha de outras animações)
    // aplica apenas uma vez
    if (!renderer.__capsuleSyncPatched) {
        const origRender = renderer.render.bind(renderer);
        renderer.render = function(sceneArg, cameraArg){
            syncFromScroll();
            return origRender(sceneArg, cameraArg);
        };
        renderer.__capsuleSyncPatched = true;
    }

    // Além disso, garante no nível do objeto: executa antes de renderizar o grupo
    if (!capsuleGroup.__syncBeforeRenderAttached) {
        capsuleGroup.onBeforeRender = () => {
            try { syncFromScroll(); } catch (e) { /* no-op */ }
        };
        capsuleGroup.__syncBeforeRenderAttached = true;
    }

  // mantém as métricas atualizadas e aplica estado inicial
  window.addEventListener('resize', () => { recalc(); });
  if (window.lenis && typeof window.lenis.on === 'function'){
    window.lenis.on('scroll', () => { /* render loop já chama sync; nada a fazer */ });
  } else {
    window.addEventListener('scroll', () => { /* idem */ }, { passive: true });
  }

  // aplica já no primeiro frame (evita “aparecer do nada”)
  syncFromScroll();
})();




    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    const productToggle = document.getElementById('product-toggle');
    if (productToggle) {
        productToggle.addEventListener('change', () => {
            setTheme(productToggle.checked ? 'aqua' : 'citrus');
        });
    }
    
    setTheme(document.body.classList.contains('theme-aqua') ? 'aqua' : 'citrus');
}








function bootAnimations() {
    if (window.__bootedAnimations) return; // evita rodar 2x
    window.__bootedAnimations = true;
    console.log('Iniciando reconstrução das animações...');

        console.log('[TEMA] Aplicando tema inicial: theme-citrus');
    document.body.classList.add("theme-citrus");


    // 1. Configurar Lenis (SEMPRE PRIMEIRO)
    setupLenis(); // ✅ CHAMANDO A FUNÇÃO

    // 2. Registrar plugins e eases do GSAP
    setupGsapPlugins(); // ✅ CHAMANDO A FUNÇÃO

    // 3. Ativar as animações e interatividades individuais
    setupButtonRipples(); // ✅ CHAMANDO A FUNÇÃO
    initTextAnimations(); // ✅ CHAMANDO A FUNÇÃO
    

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
    //  BLOCO DOS BENEFÍCIOS 
    // ===================================
    const benefitsSection = document.getElementById('beneficios');
    if (benefitsSection) {
        console.log('[BENEFÍCIOS] Seção encontrada. Inicializando animações...');

        // Hover blob follow
        const cards = benefitsSection.querySelectorAll('.sopy-benefits-card');
        cards.forEach(card => {
            const blob = card.querySelector('.sopy-benefits-card-blob');
            if (blob) {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    gsap.to(blob, { 
                        x: x - (blob.clientWidth / 2), 
                        y: y - (blob.clientHeight / 2),
                        duration: 0.3,
                        ease: 'power2.out' 
                    });
                });
            }
        });

        // GSAP entrance animations - funciona em desktop e mobile
        if (window.matchMedia('(min-width: 1024px)').matches) {
            // Desktop: animações com ScrollTrigger scrub
            gsap.from("#beneficios .sopy-benefits-col:nth-child(1) .sopy-benefits-card", {
                scrollTrigger: {
                    trigger: "#beneficios .sopy-benefits-grid",
                    start: "top 80%",
                    end: "center 50%",
                    scrub: 0.3,
                },
                y: 50,
                x: -250,
                rotation: -20,
                opacity: 0,
                stagger: 0.2
            });

            gsap.from("#beneficios .sopy-benefits-col:nth-child(2) .sopy-benefits-card", {
                scrollTrigger: {
                    trigger: "#beneficios .sopy-benefits-grid",
                    start: "top 80%",
                    end: "center 50%",
                    scrub: 0.3,
                },
                y: 50,
                x: 250,
                rotation: 20,
                opacity: 0,
                stagger: 0.2
            });
        } else {
            // Mobile: animações simples sem scrub
            gsap.from("#beneficios .sopy-benefits-col:nth-child(1) .sopy-benefits-card", {
                scrollTrigger: {
                    trigger: "#beneficios .sopy-benefits-grid",
                    start: "top 90%",
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            });

            gsap.from("#beneficios .sopy-benefits-col:nth-child(2) .sopy-benefits-card", {
                scrollTrigger: {
                    trigger: "#beneficios .sopy-benefits-grid",
                    start: "top 90%",
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }

    } else {
        console.log('[BENEFÍCIOS] Seção #beneficios não encontrada.');
    }


    // ===================================
    //  BLOCO COMO USAR (DESKTOP E MOBILE) + BARRA DE PROGRESSO
    // ===================================

    // --- Parte 1: Lógica para a seção "Como Usar" ---
    const howSection = document.querySelector('.sopy-how-section');
    if (howSection) {
        console.log('[COMO USAR] Seção encontrada. Verificando versão Desktop/Mobile...');

        const track = howSection.querySelector('.sopy-how-track');
        const panels = track ? Array.from(track.querySelectorAll('.sopy-how-panel')) : [];
        const dots = howSection.querySelectorAll('.sopy-how-progress-dot');
        const progressWrap = howSection.querySelector('.sopy-how-progress');
        const progressPill = progressWrap ? progressWrap.querySelector('.sopy-how-progress-pill') : null;
        const bgText = howSection.querySelector('.sopy-how-bg-text');

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // Fallback: position cards for mobile-only experience
            if (!window.matchMedia('(min-width:1024px)').matches) {
                const stack = howSection.querySelector('.sopy-how-stack');
                if (stack) {
                    // Simple fallback positioning
                    Array.from(stack.querySelectorAll('.sopy-how-mobile-card')).forEach((c, i) => c.style.transform = `translateX(${i * 100}%)`);
                }
            }
        } else {
            // Utility: set track width explicit so getDistance is accurate and background text can span
            const setTrackWidth = () => {
                if (!track) return;
                track.style.width = `${Math.max(1, panels.length) * window.innerWidth}px`;
                // make background text span the same visual area (in vw) so it "ocupa o scroll"
                if (bgText) {
                    bgText.style.width = `${panels.length * 100}vw`;
                }
            };
            setTrackWidth();

            const getDistance = () => track ? Math.max(0, track.scrollWidth - window.innerWidth) : 0;

            // DESKTOP: horizontal pin with progress inside the section + bg text horizontal
            if (window.matchMedia('(min-width:1024px)').matches && track && panels.length > 0) {
                const tween = gsap.to(track, {
                    x: () => -getDistance(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: howSection,
                        start: 'top top',
                        end: () => `+=${getDistance()}`,
                        pin: true,
                        scrub: 0.6,
                        invalidateOnRefresh: true,
                        onRefresh: () => {
                            setTrackWidth();
                        },
                        onEnter: () => progressWrap?.classList.add('visible'),
                        onEnterBack: () => progressWrap?.classList.add('visible'),
                        onLeave: () => progressWrap?.classList.remove('visible'),
                        onLeaveBack: () => progressWrap?.classList.remove('visible'),
                        onUpdate: self => {
                            // dots
                            if (dots && dots.length) {
                                const steps = dots.length;
                                const idx = Math.min(steps - 1, Math.max(0, Math.round(self.progress * (steps - 1))));
                                dots.forEach((d, i) => d.classList.toggle('active', i === idx));
                            }

                            // section progress pill (0..1)
                            if (progressPill) {
                                const p = Math.max(0, Math.min(1, self.progress));
                                progressPill.style.transform = `scaleX(${p})`;
                            }

                            // background text parallax/occupy effect: move proportionally to scroll but slightly slower
                            if (bgText) {
                                const bgMax = Math.max(0, bgText.scrollWidth - window.innerWidth);
                                const x = bgMax * self.progress; // 0 -> bgMax
                                bgText.style.transform = `translateX(${-x}px)`;
                            }
                        }
                    }
                });

                // refresh handlers
                window.addEventListener('resize', () => {
                    setTrackWidth();
                    try { ScrollTrigger.refresh(); } catch (e) {}
                });
            }

            // MOBILE: Touch slider independente do scroll - só touch/drag
            if (!window.matchMedia('(min-width:1024px)').matches) {
                const stack = howSection.querySelector('.sopy-how-stack');
                const cards = stack ? Array.from(stack.querySelectorAll('.sopy-how-mobile-card')) : [];
                const dots = howSection.querySelectorAll('.sopy-how-progress-dot');
                if (stack && cards.length) {
                    let currentIndex = 0;
                    let isAnimating = false;
                    
                    // Mostrar progress bar no mobile também
                    if (progressWrap) progressWrap.classList.add('visible');
                    
                    // Position cards
                    const positionCards = (animate = true) => {
                        const gap = 24;
                        const containerWidth = stack.clientWidth;
                        cards.forEach((card, index) => {
                            const offset = (index - currentIndex) * (containerWidth + gap);
                            if (typeof gsap !== 'undefined') {
                                gsap.to(card, { x: offset, opacity: index === currentIndex ? 1 : 0.7, duration: animate ? 0.4 : 0, ease: 'power2.out' });
                            } else {
                                card.style.transform = `translateX(${offset}px)`;
                                card.style.opacity = index === currentIndex ? 1 : 0.7;
                            }
                        });
                        // update dots
                        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
                        // update section progress pill as fraction
                        if (progressPill) {
                            const p = cards.length > 1 ? currentIndex / (cards.length - 1) : 0;
                            progressPill.style.transform = `scaleX(${p})`;
                        }
                    };

                    const slideTo = (index) => {
                        if (isAnimating || index === currentIndex) return;
                        const target = Math.max(0, Math.min(cards.length - 1, index));
                        isAnimating = true;
                        currentIndex = target;
                        positionCards();
                        setTimeout(() => { isAnimating = false; }, 400);
                    };

                    // touch handlers
                    let isDragging = false;
                    let startX = 0;
                    let startY = 0;
                    let deltaX = 0;

                    const handleStart = (e) => {
                        if (isAnimating) return;
                        isDragging = true;
                        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                        deltaX = 0;
                        stack.classList.add('sopy-how-grabbing');
                        if (e.type === 'mousedown') e.preventDefault();
                    };

                    const handleMove = (e) => {
                        if (!isDragging) return;
                        const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                        const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                        deltaX = currentX - startX;
                        const deltaY = Math.abs(currentY - startY);
                        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
                            e.preventDefault();
                            const gap = 24;
                            const containerWidth = stack.clientWidth;
                            cards.forEach((card, index) => {
                                const baseOffset = (index - currentIndex) * (containerWidth + gap);
                                const offset = baseOffset + deltaX;
                                if (typeof gsap !== 'undefined') gsap.set(card, { x: offset }); else card.style.transform = `translateX(${offset}px)`;
                            });
                        }
                    };

                    const handleEnd = () => {
                        if (!isDragging) return;
                        isDragging = false;
                        stack.classList.remove('sopy-how-grabbing');
                        const threshold = stack.clientWidth * 0.2;
                        if (Math.abs(deltaX) > threshold) {
                            const direction = deltaX > 0 ? -1 : 1;
                            slideTo(currentIndex + direction);
                        } else {
                            positionCards();
                        }
                    };

                    // listeners
                    stack.addEventListener('touchstart', handleStart, { passive: false });
                    stack.addEventListener('touchmove', handleMove, { passive: false });
                    stack.addEventListener('touchend', handleEnd);
                    stack.addEventListener('mousedown', handleStart);
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleEnd);

                    // dots
                    dots.forEach((dot, i) => dot.addEventListener('click', () => slideTo(i)));

                    // init
                    positionCards(false);
                    let resizeTimeout;
                    window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => positionCards(false), 100); });
                }
            }
        }
    }

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
            
            // Mostrar progress quando entrar na seção
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        tcProgressWrap.classList.add('visible');
                    } else {
                        tcProgressWrap.classList.remove('visible');
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(testimonialsSection);

            // If GSAP ScrollTrigger is available, prefer it for more accurate enter/leave visibility
            try {
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.create({
                        trigger: testimonialsSection,
                        start: 'top 40%',
                        end: 'bottom 40%',
                        onEnter: () => tcProgressWrap.classList.add('visible'),
                        onEnterBack: () => tcProgressWrap.classList.add('visible'),
                        onLeave: () => tcProgressWrap.classList.remove('visible'),
                        onLeaveBack: () => tcProgressWrap.classList.remove('visible')
                    });
                }
            } catch (e) { /* ignore if ScrollTrigger isn't present */ }

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

    // 4. Refresh final de segurança
    setTimeout(() => {
        if (window.ScrollTrigger) {
            console.log('✅ Forçando refresh final do ScrollTrigger.');
            ScrollTrigger.refresh();
        }
    }, 500);

    
    
} // Fim da função bootAnimations

// Auto-start quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try { bootAnimations(); } catch (e) { console.error('[BOOT] Falha ao iniciar animações:', e); }
    });
} else {
    try { bootAnimations(); } catch (e) { console.error('[BOOT] Falha ao iniciar animações:', e); }
}