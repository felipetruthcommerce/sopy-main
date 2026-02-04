// --- PARTE 1: DEFINIÇÃO DAS FUNÇÕES DE APOIO ---

// Respect 'sopy-force-theme' marker injected by sections.html.
// If present, set a pending theme early so the rest of the script honors it.
(function () {
    try {
        const el = document.getElementById('sopy-force-theme');
        if (el) {
            const t = (el.dataset && el.dataset.theme) ? el.dataset.theme : el.getAttribute('data-theme');
            if (t === 'aqua' || t === 'citrus') {
                window.__pendingTheme = t;
                // also set body classes early so CSS toggles immediately
                if (document && document.body) {
                    document.body.classList.toggle('theme-aqua', t === 'aqua');
                    document.body.classList.toggle('theme-citrus', t === 'citrus');
                }
            }
        }
    } catch (e) { /* silent */ }
})();

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
    } catch { }
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

// const MODELS = {
//     aqua: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509853615_aqua.glb",
//     citrus: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509855927_citrus.glb",
// };

const MODELS = {
    aqua: "https://felipetruthcommerce.github.io/sopy-main/assets/models/3D-Sopy-Capsula-Azul-v024.glb",
    citrus: "https://felipetruthcommerce.github.io/sopy-main/assets/models/3D-Sopy-Capsula-Verde-v024.glb",
};

const COLORS = {
    aqua: { a: '#076DF2', b: '#0C87F2', c: '#1DDDF2' },
    citrus: { a: '#5FD97E', b: '#91D9A3', c: '#D7D9D2' },
};

// Helper: fade-swap for <img> elements
function fadeSwapImg(imgEl, newSrc, duration = 320) {
    if (!imgEl || !newSrc) return;
    const current = (imgEl.getAttribute('src') || imgEl.src || '');
    if (current && current.includes(newSrc.split('/').pop())) return;

    const preload = new Image();
    preload.onload = () => {
        try {
            const prevTransition = imgEl.style.transition || '';
            // ensure element is visible and has an opacity value
            const comp = window.getComputedStyle(imgEl);
            if (!comp) { imgEl.src = newSrc; return; }
            const startOpacity = parseFloat(comp.opacity || 1);
            imgEl.style.transition = `opacity ${duration}ms ease`;

            if (startOpacity > 0) {
                const onFadeOut = () => {
                    imgEl.removeEventListener('transitionend', onFadeOut);
                    try { imgEl.src = newSrc; } catch (e) { }
                    // fade in
                    requestAnimationFrame(() => { imgEl.style.opacity = '1'; });
                    // cleanup transition after finished
                    setTimeout(() => { try { imgEl.style.transition = prevTransition; } catch (e) { } }, duration + 50);
                };
                imgEl.addEventListener('transitionend', onFadeOut);
                // trigger fade-out
                requestAnimationFrame(() => { imgEl.style.opacity = '0'; });
            } else {
                // already invisible: set src and fade in
                imgEl.src = newSrc;
                requestAnimationFrame(() => { imgEl.style.opacity = '1'; });
                setTimeout(() => { try { imgEl.style.transition = prevTransition; } catch (e) { } }, duration + 50);
            }
        } catch (e) {
            imgEl.src = newSrc;
        }
    };
    preload.onerror = () => { imgEl.src = newSrc; };
    preload.src = newSrc;
}

// Helper: fade-swap for elements with background-image (creates overlay div)
function fadeSwapBackground(el, newBg, duration = 320) {
    if (!el || !newBg) return;
    const currentBg = (el.style.backgroundImage || '').replace(/url\(["']?(.*?)["']?\)/, '$1');
    if (currentBg && currentBg.includes(newBg.split('/').pop())) return;

    const preload = new Image();
    preload.onload = () => {
        try {
            // ensure container can hold absolute overlay
            const cs = window.getComputedStyle(el);
            if (cs.position === 'static') el.style.position = 'relative';

            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'absolute', inset: '0',
                backgroundImage: `url('${newBg}')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: '0', transition: `opacity ${duration}ms ease`, zIndex: 2, pointerEvents: 'none'
            });
            el.appendChild(overlay);
            // force paint then fade in
            requestAnimationFrame(() => { overlay.style.opacity = '1'; });

            const onEnd = () => {
                overlay.removeEventListener('transitionend', onEnd);
                try { el.style.backgroundImage = `url('${newBg}')`; } catch (e) { }
                overlay.remove();
            };
            overlay.addEventListener('transitionend', onEnd);
            // safety: in case transitionend doesn't fire
            setTimeout(() => { if (overlay.parentNode) { try { el.style.backgroundImage = `url('${newBg}')`; } catch (e) { }; overlay.remove(); } }, duration + 200);
        } catch (e) {
            try { el.style.backgroundImage = `url('${newBg}')`; } catch (e) { }
        }
    };
    preload.onerror = () => { try { el.style.backgroundImage = `url('${newBg}')`; } catch (e) { } };
    preload.src = newBg;
}

function swapModel(theme) {
    // 3D model loading removed: we no longer load GLTF models.
    // Mantemos a API para chamadas externas (setTheme chama swapModel),
    // mas aqui apenas registramos e garantimos que a imagem 2D seja usada.
    console.log(`[3D] swapModel chamado para '${theme}', porém carregamento 3D foi desativado. Usando imagem 2D.`);
    // Marca tema pendente caso a inicialização da UI precise aplicar depois
    window.__pendingTheme = theme;
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
                    fadeSwapImg(sopyCardImage, newSrc, 360);
                    console.log(`[TEMA] Imagem ${theme} carregada com sucesso`);
                };
                img.onerror = () => {
                    console.warn(`[TEMA] Erro ao carregar imagem ${theme}:`, newSrc);
                    sopyCardImage.src = newSrc;
                };
                img.src = newSrc;
            }
        }
    } catch (e) {
        console.warn('[TEMA] Falha ao trocar imagem do card:', e);
    }
    // Atualiza a imagem 2D da cápsula (se estiver sendo usada)
    try {
        const capsulePhoto = document.querySelector('.capsule-2d-photo');
        if (capsulePhoto) {
            const newSrc = theme === 'citrus' ? capsulePhoto.getAttribute('data-citrus') : capsulePhoto.getAttribute('data-aqua');
            if (newSrc) fadeSwapImg(capsulePhoto, newSrc, 360);
        }
    } catch (e) {
        console.warn('[TEMA] Falha ao trocar imagem 2D da cápsula:', e);
    }

    // Atualiza imagens da seção de benefícios (sustentabilidade) quando houver data attributes
    try {
        const panels = document.querySelectorAll('#sustentabilidade .fullscreen-panel .image-wrapper img');
        panels.forEach(img => {
            const newSrc = theme === 'citrus' ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
            if (!newSrc) return;
            const current = (img.getAttribute('src') || img.src || '').split('/').pop();
            if (current && current.includes(newSrc.split('/').pop())) return;

            const p = new Image();
            p.onload = () => { try { fadeSwapImg(img, newSrc, 360); } catch (e) { } };
            p.onerror = () => { try { img.src = newSrc; } catch (e) { } };
            p.src = newSrc;
        });
    } catch (e) {
        console.warn('[TEMA] Falha ao atualizar imagens de benefícios:', e);
    }

    // Atualiza imagens do slider (slides 1 e 2) se dados de tema estiverem presentes
    try {
        const themedSlides = document.querySelectorAll('.slider-item[data-slide]');
        themedSlides.forEach(slide => {
            const newBg = theme === 'citrus' ? slide.getAttribute('data-citrus') : slide.getAttribute('data-aqua');
            if (!newBg) return;

            // evitar trocar se já estiver usando a mesma imagem
            const currentBg = (slide.style.backgroundImage || '').replace(/url\(["']?(.*?)["']?\)/, '$1');
            if (currentBg && currentBg.includes(newBg.split('/').pop())) return;

            // preload antes de aplicar para evitar flicker
            const img = new Image();
            img.onload = () => {
                try { fadeSwapBackground(slide, newBg, 360); } catch (e) { slide.style.backgroundImage = `url('${newBg}')`; }
            };
            img.onerror = () => { /* fallback: aplicar mesmo assim */ slide.style.backgroundImage = `url('${newBg}')`; };
            img.src = newBg;
        });
    } catch (e) {
        console.warn('[TEMA] Falha ao atualizar imagens do slider:', e);
    }

    // ... (seu código para atualizar textos do card de produto) ...

    // Atualiza também os textos do card de produto (se presentes no DOM).
    try {
        // Atualiza todos os CTAs dentro da seção (caso haja duplicatas/opposite)
        const ctas = document.querySelectorAll('.capsule-3d-cta');
        if (ctas && ctas.length) {
            ctas.forEach(cta => {
                const titleEl = cta.querySelector('.product-title');
                const priceEl = cta.querySelector('.product-price');
                const copyEl = cta.querySelector('.product-copy');
                const btnEl = cta.querySelector('.sopy-product-cta');

                const pick = (el, key) => {
                    if (!el) return;
                    const dataKey = `data-${key}`;
                    const v = el.getAttribute(dataKey);
                    if (v != null) el.textContent = v;
                };

                pick(titleEl, theme === 'citrus' ? 'citrus' : 'aqua');
                pick(priceEl, theme === 'citrus' ? 'citrus' : 'aqua');
                pick(copyEl, theme === 'citrus' ? 'citrus' : 'aqua');

                if (btnEl) {
                    const btnData = btnEl.getAttribute(theme === 'citrus' ? 'data-citrus' : 'data-aqua');
                    if (btnData != null) btnEl.textContent = btnData;
                }

                // Garante que ambos CTAs fiquem visíveis quando o tema muda
                cta.classList.add('is-visible');
            });
        }
    } catch (e) {
        console.warn('[TEMA] Falha ao atualizar textos do CTA:', e);
    }

    // Atualiza as imagens de overlay dentro de cada CTA para o tema atual
    try {
        const overlays = document.querySelectorAll('#capsula-3d .capsule-3d-cta .cta-overlay');
        if (overlays && overlays.length) {
            overlays.forEach(img => {
                const newSrc = theme === 'citrus' ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
                if (newSrc) fadeSwapImg(img, newSrc, 300);
            });
        }
    } catch (e) { /* silent */ }

    // Update benefit titles colors based on theme (CSS handles this via body class)
    // Force a repaint to ensure theme colors are applied immediately
    const benefitTitles = document.querySelectorAll('.benefit-title');
    benefitTitles.forEach(title => {
        const h2 = title.querySelector('h2');
        if (h2) h2.style.color = h2.style.color; // force repaint
    });

    // Update fragrance image for the sustainability panels to match the theme
    try {
        if (typeof updateFragranceImage === 'function') updateFragranceImage(theme);
    } catch (e) {
        console.warn('[TEMA] Falha ao atualizar imagem de fragrância:', e);
    }

    swapModel(theme);
}

// ===================================================
// FUNCIONALIDADE: BOLHAS INTERATIVAS 3D
// Bolhas flutuantes com física, explosões de partículas, HDRI lighting
// ===================================================
function initCapsuleBubbles() {
    const container = document.querySelector('.sopy-capsule-bubbles');
    if (!container || typeof THREE === 'undefined') return;

    // Evita inicialização múltipla
    if (container.__bubblesInitialized) return;
    container.__bubblesInitialized = true;

    console.log('[BUBBLES] Inicializando bolhas 3D...');

    // --- CONFIGURAÇÃO BÁSICA ---
    const scene = new THREE.Scene();
    scene.background = null; // mantém o fundo transparente para integrar com a seção

    const rect = container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(75, rect.width / Math.max(1, rect.height), 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(rect.width, Math.max(1, rect.height));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;

    // insere o canvas dentro do container
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%'
    });

    // Se o container ainda não tiver tamanho estável, ajusta em seguida
    if (rect.width < 10 || rect.height < 10) {
        requestAnimationFrame(() => {
            const r2 = container.getBoundingClientRect();
            camera.aspect = r2.width / Math.max(1, r2.height);
            camera.updateProjectionMatrix();
            renderer.setSize(r2.width, Math.max(1, r2.height));
        });
    }

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
                    hdrLoaded = true;
                    console.log('[BUBBLES] HDRI carregado com sucesso');
                    createInitialBubbles();
                },
                undefined,
                function () {
                    console.warn('[BUBBLES] Falha ao carregar HDRI. Prosseguindo sem environment map.');
                    createInitialBubbles();
                }
            );
        // Fallback de tempo: se HDRI demorar, inicia mesmo assim
        setTimeout(() => { if (!hdrLoaded) createInitialBubbles(); }, 2000);
    } else {
        console.warn('[BUBBLES] RGBELoader não disponível. Prosseguindo sem HDRI.');
        createInitialBubbles();
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- OBJETOS (AS BOLHAS) ---
    const bubbles = [];
    const bubbleCount = 10;
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
            // fallback sem envMap
            material.transmission = 0.0;
            material.opacity = 0.35;
            material.roughness = 0.15;
            material.metalness = 0.0;
            material.clearcoat = 0.6;
            material.clearcoatRoughness = 0.2;
        }

        const bubble = new THREE.Mesh(bubbleGeometry, material);
        bubble.position.x = THREE.MathUtils.randFloatSpread(40);
        bubble.position.y = THREE.MathUtils.randFloat(-25, -15);
        bubble.position.z = THREE.MathUtils.randFloatSpread(10);

        const scale = THREE.MathUtils.randFloat(0.3, 1.2); // Reduzido de 0.4-2.0 para bolhas menores
        bubble.scale.set(scale, scale, scale);

        bubble.userData = {
            speed: THREE.MathUtils.randFloat(0.05, 0.15),
            amplitudeX: THREE.MathUtils.randFloat(1, 4),
            frequencyX: THREE.MathUtils.randFloat(0.5, 1.5),
            oscillationOffset: Math.random() * Math.PI * 2,
            originalX: bubble.position.x
        };

        scene.add(bubble);
        bubbles.push(bubble);
    }

    function createInitialBubbles() {
        for (let i = 0; i < bubbleCount; i++) {
            createBubble();
        }
        animate();
        console.log('[BUBBLES] Animação iniciada com', bubbleCount, 'bolhas');
    }

    // --- INTERAÇÃO (CLIQUE E EXPLOSÃO) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let particleSystems = [];

    const particleTexture = new THREE.CanvasTexture(generateParticleTexture());

    function generateParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
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
        const particleCount = 30;

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15 * bubbleScale, // Reduzido de 0.3 para partículas menores
            map: particleTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        const particleGeometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        const lives = [];
        const maxLives = [];
        const colors = [];
        const sizes = [];

        const baseColor = new THREE.Color(0xADD8E6);
        const white = new THREE.Color(0xFFFFFF);

        for (let i = 0; i < particleCount; i++) {
            positions.push(position.x, position.y, position.z);

            const speed = THREE.MathUtils.randFloat(0.2, 0.5) * bubbleScale; // Reduzido de 0.3-0.8 para explosão mais contida
            velocities.push(
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.5) * speed
            );

            const life = THREE.MathUtils.randFloat(0.8, 1.5);
            lives.push(life);
            maxLives.push(life);

            const particleColor = baseColor.clone().lerp(white, THREE.MathUtils.randFloat(0.2, 0.8));
            colors.push(particleColor.r, particleColor.g, particleColor.b);
            sizes.push(THREE.MathUtils.randFloat(0.5, 1.5) * particleMaterial.size);
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        particleGeometry.setAttribute('life', new THREE.Float32BufferAttribute(lives, 1));
        particleGeometry.setAttribute('maxLife', new THREE.Float32BufferAttribute(maxLives, 1));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
        particleSystems.push(particleSystem);
    }

    // --- ANIMAÇÃO ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Animação das bolhas
        bubbles.forEach(bubble => {
            bubble.position.y += bubble.userData.speed * delta * 60;

            const time = performance.now() * 0.001;
            bubble.position.x = bubble.userData.originalX +
                Math.sin(time * bubble.userData.frequencyX + bubble.userData.oscillationOffset) *
                bubble.userData.amplitudeX;

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

            let allParticlesDead = true;

            for (let i = 0; i < positions.length; i += 3) {
                const particleIndex = i / 3;
                lives[particleIndex] -= delta;

                if (lives[particleIndex] > 0) {
                    allParticlesDead = false;

                    positions[i] += velocities[i] * delta * 60;
                    positions[i + 1] += velocities[i + 1] * delta * 60;
                    positions[i + 2] += velocities[i + 2] * delta * 60;

                    const lifeRatio = lives[particleIndex] / maxLives[particleIndex];
                    system.material.opacity = Math.max(0, lifeRatio);

                    const initialColor = new THREE.Color(colors[i], colors[i + 1], colors[i + 2]);
                    const finalColor = new THREE.Color(0x000000);
                    initialColor.lerp(finalColor, 1 - lifeRatio);
                    system.geometry.attributes.color.setXYZ(particleIndex, initialColor.r, initialColor.g, initialColor.b);
                } else {
                    positions[i] = positions[i + 1] = positions[i + 2] = 10000;
                }
            }

            system.geometry.attributes.position.needsUpdate = true;
            system.geometry.attributes.life.needsUpdate = true;
            system.geometry.attributes.color.needsUpdate = true;

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

// ===================================================
// Atualiza a imagem da seção "Fragrâncias da alta perfumaria" conforme o tema
// Procura a seção pelo título e troca o `src` do elemento <video> ou <img>
// ===================================================
function updateFragranceImage(theme) {
    try {
        const FRAGRANCE_BASE = 'https://felipetruthcommerce.github.io/sopy-main/assets/images/';
        const FILES = {
            // use the existing file name in assets/images (jpg version available)
            citrus: 'perfume-citrus-01.jpg',
            aqua: 'perfume-aqua-01.png'
        };

        // procura a seção que tem o título relacionado a "Fragrâncias"
        const panels = document.querySelectorAll('.fullscreen-panel');
        let target = null;
        panels.forEach(p => {
            const h2 = p.querySelector('h2');
            if (h2 && /fragrâncias/i.test(h2.textContent)) {
                target = p;
            }
        });
        if (!target) return;

        // seleciona tanto <video> quanto <img> dentro de .image-wrapper
        const media = target.querySelector('.image-wrapper video, .image-wrapper img');
        if (!media) return;

        const file = theme === 'citrus' ? FILES.citrus : FILES.aqua;
        const newSrc = FRAGRANCE_BASE + file;

        // evita trocar se já for a mesma imagem
        const currentName = (media.getAttribute('src') || media.src || '').split('/').pop();
        if (currentName === file) return;

        // preload para evitar flicker
        const img = new Image();
        img.onload = () => {
            try {
                if (media.tagName && media.tagName.toLowerCase() === 'img') {
                    fadeSwapImg(media, newSrc, 360);
                } else {
                    media.src = newSrc;
                }
                // se for vídeo, recarrega e tenta tocar (autoplay settings podem impedir)
                if (media.tagName && media.tagName.toLowerCase() === 'video') {
                    media.load();
                    if (media.autoplay) media.play && media.play().catch(() => { });
                }
                console.log('[TEMA] Imagem de fragrância atualizada para', theme, newSrc);
            } catch (e) {
                console.warn('[TEMA] Erro ao aplicar imagem de fragrância:', e);
            }
        };
        img.onerror = () => {
            console.warn('[TEMA] Erro ao carregar imagem de fragrância:', newSrc);
        };
        img.src = newSrc;
    } catch (e) {
        console.warn('[TEMA] updateFragranceImage falhou:', e);
    }
}

// === ROTATING BANNER: simples alternador entre 2 imagens ===
function initRotatingBanner() {
    const section = document.getElementById('rotating-banner');
    if (!section) return;

    const slides = Array.from(section.querySelectorAll('.banner-slide'));
    if (slides.length < 2) return;

    let current = 0;
    let timeoutId = null;
    const interval = 5000; // 5s

    function show(index) {
        slides.forEach((s, i) => {
            const isActive = i === index;
            s.classList.toggle('active', isActive);
            s.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });
        current = index;
    }

    function next() { show((current + 1) % slides.length); }
    function prev() { show((current - 1 + slides.length) % slides.length); }

    const btnNext = section.querySelector('.rb-next');
    const btnPrev = section.querySelector('.rb-prev');
    if (btnNext) btnNext.addEventListener('click', () => { next(); restart(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { prev(); restart(); });

    function restart() {
        if (timeoutId) clearInterval(timeoutId);
        timeoutId = setInterval(next, interval);
    }

    // iniciar
    show(0);
    restart();

    // pausar a rotação quando a aba estiver oculta
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (timeoutId) clearInterval(timeoutId);
        } else {
            restart();
        }
    });
}

// inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRotatingBanner);
} else {
    initRotatingBanner();
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
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 1.6); // brilho principal
    key.position.set(2.8, 3.5, 2.2);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.5); // suaviza sombras
    fill.position.set(-2.2, 0.6, 2.0);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.35); // recorte por trás
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
            scene.background = null;  // mantemos teu gradiente da página
            hdr.dispose();
            pmrem.dispose();
        }, undefined, (e) => console.warn('[3D] Falha ao carregar HDRI:', e));

    // === SPIN ON SCROLL (giro por scroll – sem pin) ===
    (function setupCapsuleSpinOnScroll() {
        const spinSection = document.getElementById('capsula-3d');
        if (!spinSection) return;

        // Se desejarmos usar a versão 2D (foto) ao invés do modelo 3D,
        // injetamos uma imagem central dentro do `#three-container`.
        try {
            const threeContainer = document.getElementById('three-container');
            if (threeContainer && !document.querySelector('.capsule-2d-photo')) {
                const img = document.createElement('img');
                img.className = 'capsule-2d-photo';
                // caminhos absolutos no GitHub Pages (usar arquivos finais do repo)
                img.setAttribute('data-aqua', 'https://felipetruthcommerce.github.io/sopy-main/assets/images/Soby-Capsula-Azul-01-Frente-011.png');
                img.setAttribute('data-citrus', 'https://felipetruthcommerce.github.io/sopy-main/assets/images/Soby-Capsula-Verde-01-Frente-011.png');
                img.alt = 'Cápsula Sopy';
                // define src inicial baseado na classe do body
                img.src = document.body.classList.contains('theme-citrus') ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
                threeContainer.appendChild(img);
            }
        } catch (e) {
            console.warn('[3D->2D] Falha ao injetar imagem 2D:', e);
        }

        const TWO_PI = Math.PI * 2;
        let spinRaf = null;
        let lastP = -1; // para debouncing

        // progresso 0..1: começa quando o topo da seção encosta no fundo da viewport
        // e termina quando o fundo da seção encosta no topo da viewport
        function computeProgress() {
            const rect = spinSection.getBoundingClientRect();
            const vh = window.innerHeight;
            const total = rect.height + vh;     // faixa “vista” total
            const seen = vh - rect.top;        // quanto da faixa já passou
            return Math.max(0, Math.min(1, seen / total));
        }

        function applySpin(p) {
            // --- limites do trecho em que acontece o giro (frações do progresso 0..1)
            const SPIN_START = 0.05;  // começa a girar depois de 5% da seção
            const SPIN_END = 0.65;  // termina o giro em 65% da seção

            // memoriza o yaw inicial do modelo na primeira atualização (se existir)
            if (window.__capsuleBaseYaw == null) {
                window.__capsuleBaseYaw = (capsuleGroup && capsuleGroup.rotation && typeof capsuleGroup.rotation.y === 'number') ? capsuleGroup.rotation.y : 0;
            }

            // normaliza o progresso p para o intervalo [SPIN_START..SPIN_END]
            let t = (p - SPIN_START) / (SPIN_END - SPIN_START);
            t = Math.max(0, Math.min(1, t)); // clamp 0..1

            // faz exatamente 360° nesse intervalo e PARA
            // Se a foto 2D estiver presente, animamos ela via CSS (rotação no sentido horário)
            const photoEl = document.querySelector('.capsule-2d-photo');
            if (photoEl) {
                const deg = t * 360; // 0..360 graus
                photoEl.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
            } else {
                const yaw = window.__capsuleBaseYaw + t * (Math.PI * 2);
                if (capsuleGroup && capsuleGroup.rotation) capsuleGroup.rotation.y = yaw;
            }

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

        function onScrollSpin() {
            if (spinRaf) return;
            spinRaf = requestAnimationFrame(() => {
                spinRaf = null;
                const p = computeProgress();
                if (p === lastP) return;
                lastP = p;
                applySpin(p);
            });
        }

        // usa Lenis se existir; senão, scroll nativo
        if (window.lenis && typeof window.lenis.on === 'function') {
            window.lenis.on('scroll', onScrollSpin);
        } else {
            window.addEventListener('scroll', onScrollSpin, { passive: true });
        }
        window.addEventListener('resize', onScrollSpin);

        // estado inicial
        onScrollSpin();
    })();

    // === MOSTRAR O CARD DO PRODUTO NA SEÇÃO 3D E HINT NO TOGGLE ===
    (function setupCapsuleCtaTrigger() {
        // aguarda até que o DOM e o ScrollTrigger estejam prontos
        const trySetup = () => {
            const section = document.getElementById('capsula-3d');
            const ctas = document.querySelectorAll('.capsule-3d-cta');
            const toggleContainer = document.querySelector('.product-toggle-container');

            if (!section || !ctas || !ctas.length || !toggleContainer) return;
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

            // garante que os CTAs comecem escondidos
            ctas.forEach(c => c.classList.remove('is-visible', 'at-end'));

            // ensure CTA overlay images are hidden initially (in case srcs are set elsewhere)
            try {
                const section = document.getElementById('capsula-3d');
                const overlays = section ? section.querySelectorAll('.capsule-3d-cta .cta-overlay') : null;
                if (overlays && overlays.length) {
                    overlays.forEach(img => {
                        img.style.transition = 'opacity .28s ease, transform .28s ease';
                        img.style.opacity = '0';
                        img.style.visibility = 'hidden';
                        // let CSS handle transform/positioning to ensure consistent centering
                    });
                }
            } catch (e) { /* silent */ }

            // cria o ScrollTrigger que mostra e depois marca como at-end
            // Nota: end ajustado para disparar onLeave. Mobile usa valor mais alto para fadeout mais cedo.
            const isMobile = window.innerWidth <= 900;
            const triggerEnd = isMobile ? 'bottom-=420px bottom' : 'bottom-=120px bottom';
            ScrollTrigger.create({
                trigger: section,
                start: 'top 65%',   // ajusta quando começa a aparecer
                end: triggerEnd,  // dispara onLeave - mobile faz fadeout mais cedo
                onEnter: self => {
                    ctas.forEach(c => c.classList.add('is-visible'));
                    // ensure 3D is visible when entering
                    try {
                        const three = document.getElementById('three-container');
                        const bubbles = document.querySelector('.sopy-capsule-bubbles');
                        if (three) three.classList.remove('hide-3d');
                        if (bubbles) bubbles.classList.remove('hide-3d');
                        // hide overlays
                        const section = document.getElementById('capsula-3d');
                        if (section) section.classList.remove('show-overlays');
                        // restore 2D photo visibility (if present)
                        const photo = document.querySelector('.capsule-2d-photo');
                        if (photo) {
                            photo.style.transition = 'opacity .28s ease';
                            photo.style.opacity = '1';
                            photo.style.transform = photo.style.transform || '';
                        }
                    } catch (e) { /* silent */ }
                },
                onEnterBack: self => {
                    ctas.forEach(c => c.classList.add('is-visible'));
                    // restore 3D when entering back
                    try {
                        const three = document.getElementById('three-container');
                        const bubbles = document.querySelector('.sopy-capsule-bubbles');
                        if (three) three.classList.remove('hide-3d');
                        if (bubbles) bubbles.classList.remove('hide-3d');
                        const section = document.getElementById('capsula-3d');
                        if (section) section.classList.remove('show-overlays');
                        // ensure 2D photo fades back in
                        const photo = document.querySelector('.capsule-2d-photo');
                        if (photo) {
                            photo.style.transition = 'opacity .28s ease';
                            photo.style.opacity = '1';
                        }
                    } catch (e) { /* silent */ }
                },
                onLeave: self => {
                    // quando sair para baixo, adiciona at-end para posicionamento final
                    ctas.forEach(c => c.classList.add('at-end'));
                    // fade out the 3D canvas and bubbles when leaving the section
                    try {
                        const three = document.getElementById('three-container');
                        const bubbles = document.querySelector('.sopy-capsule-bubbles');
                        if (three) three.classList.add('hide-3d');
                        if (bubbles) bubbles.classList.add('hide-3d');

                        // fade the 2D photo out first (if present), then add show-overlays
                        const section = document.getElementById('capsula-3d');
                        const photo = document.querySelector('.capsule-2d-photo');
                        const showOverlaysNow = () => {
                            if (!section) return;
                            // Determine current theme (fallback to 'aqua')
                            const theme = document.body.classList.contains('theme-citrus') ? 'citrus' : 'aqua';

                            // Preload overlay images and only add class after they're loaded (or timeout)
                            const overlays = section.querySelectorAll('.capsule-3d-cta .cta-overlay');
                            if (!overlays || overlays.length === 0) {
                                if (!section.classList.contains('show-overlays')) section.classList.add('show-overlays');
                                return;
                            }

                            const loadPromises = Array.from(overlays).map(img => {
                                return new Promise(resolve => {
                                    const newSrc = theme === 'citrus' ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
                                    if (!newSrc) return resolve();
                                    // If already set to same src, resolve immediately
                                    if (img.src && img.src.includes(newSrc.split('/').pop())) return resolve();

                                    const onLoad = () => { cleanup(); resolve(); };
                                    const onErr = () => { cleanup(); resolve(); };
                                    const cleanup = () => {
                                        img.removeEventListener('load', onLoad);
                                        img.removeEventListener('error', onErr);
                                    };

                                    img.addEventListener('load', onLoad);
                                    img.addEventListener('error', onErr);
                                    // start loading
                                    img.src = newSrc;
                                    // safety timeout in case load event doesn't fire
                                    setTimeout(() => { cleanup(); resolve(); }, 800);
                                });
                            });

                            Promise.all(loadPromises).then(() => {
                                // reveal overlays with a smooth fade-in only after images are ready
                                if (!section.classList.contains('show-overlays')) section.classList.add('show-overlays');
                                requestAnimationFrame(() => {
                                    overlays.forEach(img => {
                                        try {
                                            // make sure overlay is visible and will animate
                                            img.style.visibility = 'visible';
                                            img.style.transition = 'opacity .32s ease, transform .32s ease';
                                            // explicitly trigger fade-in by setting opacity to 1 (initial opacity should be 0)
                                            img.style.opacity = '1';
                                        } catch (e) { /* silent */ }
                                    });
                                });
                            });
                        };

                        if (photo) {
                            // ensure photo has a transition for opacity
                            photo.style.transition = 'opacity .32s ease';
                            // trigger fade
                            photo.style.opacity = '0';
                            // show overlays immediately so fade-in (overlays) and fade-out (photo) happen concurrently
                            showOverlaysNow();
                        } else {
                            // no photo present — reveal overlays immediately
                            showOverlaysNow();
                        }
                    } catch (e) { /* silent */ }
                },
                onLeaveBack: self => {
                    // quando voltar acima da seção, esconder
                    ctas.forEach(c => c.classList.remove('is-visible', 'at-end'));
                    // ensure 3D is visible again
                    try {
                        const three = document.getElementById('three-container');
                        const bubbles = document.querySelector('.sopy-capsule-bubbles');
                        if (three) three.classList.remove('hide-3d');
                        if (bubbles) bubbles.classList.remove('hide-3d');
                        const section = document.getElementById('capsula-3d');
                        if (section) section.classList.remove('show-overlays');
                        // restore 2D photo visibility when coming back
                        const photo = document.querySelector('.capsule-2d-photo');
                        if (photo) {
                            photo.style.transition = 'opacity .28s ease';
                            photo.style.opacity = '1';
                        }
                    } catch (e) { /* silent */ }
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
                    const y = (event.clientY || rect.top + rect.height / 2) - rect.top;
                    accordion.style.setProperty('--circle-x', `${x}px`);
                    accordion.style.setProperty('--circle-y', `${y}px`);
                } catch (e) { }
                // Suprimir temporariamente o header para evitar aparecer por salto de layout
                try {
                    if (typeof headerState !== 'undefined' && headerState) {
                        headerState.suppress = true;
                        if (headerState.suppressTimer) clearTimeout(headerState.suppressTimer);
                        headerState.suppressTimer = setTimeout(() => {
                            headerState.suppress = false;
                        }, 500);
                    }
                } catch (e) { }
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
                    fadeSwapImg(sopyCardImage, correctSrc, 360);
                }
            }
        } catch (e) {
            console.warn('[BENEFÍCIOS] Erro ao inicializar imagem do card:', e);
        }
    }

    // ===================================
    //  BLOCO DOS BENEFÍCIOS - CLEAN SLATE ANIMATION (COM PIN CONTROLADO)
    // ===================================
    function initBenefitsAnimations() {
        // Animação desativada: função comentada para exibir ambos os cards lado a lado.
        // Para reativar, remova o 'return' abaixo e restaure o corpo original (mantido em comentário).
        console.log('[BENEFÍCIOS] Animação clean-slate DESATIVADA (comentada pelo dev).');
        return;

        /*
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
        */
    }


    // ===================================
    //  BLOCO COMO USAR (Slider estilo referência, animado pelo scroll)
    // ===================================

    (function initComoUsar() {
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
            // Guardar background original para referência futura (protege contra reordenações DOM)
            try { s.dataset.origBg = bgImage || ''; } catch (e) { /* silent */ }
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
            // Ajuste do PREVIEW: somente quando estivermos no PENÚLTIMO slide, trocar a foto do preview
            try {
                if (slides && slides.length > 3) {
                    const previewEl = slides[2]; // terceiro item é o preview único
                    const lastIndex = slides.length - 1;
                    // Se o índice ativo for o penúltimo, force o preview para a imagem ORIGINAL do último slide
                    if (idx === lastIndex - 1) {
                        const lastBg = slides[lastIndex].dataset?.origBg || getComputedStyle(slides[lastIndex]).backgroundImage;
                        if (lastBg) previewEl.style.backgroundImage = lastBg;
                    } else {
                        // Caso contrário, restaura o preview ao seu background original (se existir)
                        const orig = previewEl.dataset?.origBg || getComputedStyle(previewEl).backgroundImage;
                        if (orig) previewEl.style.backgroundImage = orig;
                    }
                }
            } catch (e) {
                console.warn('[HOW] Falha ao ajustar preview do penúltimo slide:', e);
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
                // Se for o preview do 3º slide, force o background-image igual ao do último slide
                if (index === 2 && slides.length > 3) {
                    const lastBg = getComputedStyle(slides[slides.length - 1]).backgroundImage;
                    slide.style.backgroundImage = lastBg;
                }
                console.log(`[MOBILE SETUP SLIDE ${index}] xPercent=${index === 0 ? 0 : 100}, opacity=1, zIndex=${index === 0 ? 2 : 1}`);
            });

            // Initial
            applyActive(0);
        } else {
            if (howSection.__desktopInited) {
                applyActive(0);
                return;
            }
            howSection.__desktopInited = true;

            // Desktop: replica a lógica "one scroll = one slide" do exemplo de referência
            let currentIndex = 0;
            let isAnimating = false;
            let sectionActive = false;

            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const wheelCooldown = prefersReduced ? 700 : 500;
            let wheelLocked = false;

            const stopLenis = () => {
                if (window.lenis && typeof window.lenis.stop === 'function') {
                    window.lenis.stop();
                }
            };
            const startLenis = () => {
                if (window.lenis && typeof window.lenis.start === 'function') {
                    window.lenis.start();
                }
            };

            const activateSection = () => {
                if (sectionActive) return;
                sectionActive = true;
                stopLenis();
                console.log('[HOW] Entrou na seção desktop. Lenis pausado.');
            };

            const releaseSection = () => {
                if (!sectionActive) return;
                sectionActive = false;
                wheelLocked = false;
                startLenis();
                console.log('[HOW] Liberando scroll geral.');
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.target !== howSection) return;
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
                        activateSection();
                    } else {
                        releaseSection();
                    }
                });
            }, { threshold: [0.35, 0.5, 0.65, 0.85, 1] });
            observer.observe(howSection);

            const withLock = (fn) => {
                if (wheelLocked) return;
                wheelLocked = true;
                fn();
                setTimeout(() => { wheelLocked = false; }, wheelCooldown);
            };

            const slideTo = (targetIndex) => {
                if (isAnimating || targetIndex === currentIndex) return;

                console.log(`[DESKTOP SLIDE] ${currentIndex} -> ${targetIndex}`);
                isAnimating = true;

                const direction = targetIndex > currentIndex ? 1 : -1;
                const currentSlide = slides[currentIndex];
                const nextSlide = slides[targetIndex];

                gsap.set(nextSlide, { xPercent: direction * 100, zIndex: 2 });

                gsap.timeline({
                    defaults: { duration: 0.75, ease: 'power2.inOut' },
                    onComplete: () => {
                        currentIndex = targetIndex;
                        isAnimating = false;
                        applyActive(currentIndex);
                    }
                })
                    .to(currentSlide, { xPercent: direction * -100 }, 0)
                    .to(nextSlide, { xPercent: 0 }, 0)
                    .set(currentSlide, { zIndex: 1 });
            };

            const toNext = () => {
                if (currentIndex >= slides.length - 1) {
                    releaseSection();
                    return;
                }
                slideTo(currentIndex + 1);
            };

            const toPrev = () => {
                if (currentIndex <= 0) {
                    releaseSection();
                    return;
                }
                slideTo(currentIndex - 1);
            };

            const relevantDelta = (e) => {
                const absY = Math.abs(e.deltaY);
                const absX = Math.abs(e.deltaX);
                return absY >= absX ? e.deltaY : e.deltaX;
            };

            const wheelHandler = (e) => {
                if (!sectionActive) return;

                const delta = relevantDelta(e);
                if (Math.abs(delta) < 18) return;

                const canForward = delta > 0 && currentIndex < slides.length - 1;
                const canBackward = delta < 0 && currentIndex > 0;

                if (!canForward && !canBackward) {
                    releaseSection();
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                withLock(delta > 0 ? toNext : toPrev);
            };

            window.addEventListener('wheel', wheelHandler, { passive: false });

            const keyHandler = (e) => {
                if (!sectionActive) return;
                const k = e.key;
                if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(k)) {
                    e.preventDefault();
                    withLock(toNext);
                } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) {
                    e.preventDefault();
                    withLock(toPrev);
                }
            };
            window.addEventListener('keydown', keyHandler);

            // Nav e botões
            navItems.forEach((item, i) => item.addEventListener('click', () => slideTo(i)));
            nextBtn?.addEventListener('click', () => toNext());
            howDots.forEach((dot, i) => dot.addEventListener('click', () => slideTo(i)));

            // Setup inicial das posições
            slides.forEach((slide, index) => {
                gsap.set(slide, { xPercent: index === 0 ? 0 : 100, opacity: 1, zIndex: index === 0 ? 2 : 1 });
            });

            applyActive(0);
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
        try { if (window.lenis) window.lenis.on('scroll', updatePageProgress); } catch (e) { }
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
                // Inicializar bolhas 3D junto com a cena principal
                if (typeof THREE !== 'undefined') {
                    initCapsuleBubbles();
                }
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
    } catch (e) { console.error('[BOOT] Erro ao iniciar reveals:', e); }

    setTimeout(() => {
        if (window.ScrollTrigger) {
            console.log('✅ Forçando refresh final do ScrollTrigger.');
            ScrollTrigger.refresh();
        }
    }, 200);



} // Fim da função bootAnimations

// Observação: a inicialização automática foi removida para permitir que o host controle

// ========== SLIDER FULLSCREEN ==========
(function () {
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

    /* Atualiza classes do penúltimo e último slide */
    function updateLastSlideClass() {
        // Penúltimo slide (index 2 = slide 3)
        if (currentIndex === totalSlides - 2) {
            track.classList.add('penultimate-slide');
            track.classList.remove('last-slide');
        }
        // Último slide (index 3 = slide 4)
        else if (currentIndex === totalSlides - 1) {
            track.classList.add('last-slide');
            track.classList.remove('penultimate-slide');
        }
        // Slides 1-2
        else {
            track.classList.remove('last-slide', 'penultimate-slide');
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

    // ✨ AUMENTA A ALTURA VIRTUAL DA SEÇÃO PARA TORNAR O SCROLL MAIS LENTO
    const SCROLL_MULTIPLIER = 1.5; // Multiplicador moderado (ajuste esse valor para mais/menos lento)

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

        // Total "scrollable" MULTIPLICADO para tornar o scroll mais lento
        const baseScrollable = Math.max(sectionHeight - viewportHeight, 1);
        const totalScrollable = baseScrollable * SCROLL_MULTIPLIER;

        // Progresso normalizado (0..1) mas agora com área de scroll ampliada
        const scrolled = -Math.min(Math.max(sectionTop, -totalScrollable), 0);
        const progress = scrolled / totalScrollable;

        // LOGS DETALHADOS
        console.log('📊 SLIDER DEBUG:', {
            progress: (progress * 100).toFixed(1) + '%',
            currentIndex: currentIndex,
            sectionTop: sectionTop.toFixed(0) + 'px',
            sectionHeight: sectionHeight + 'px',
            viewportHeight: viewportHeight + 'px',
            baseScrollable: baseScrollable + 'px',
            totalScrollable: totalScrollable + 'px',
            scrolled: scrolled.toFixed(0) + 'px',
            multiplier: SCROLL_MULTIPLIER + 'x'
        });

        // Divisão LINEAR simples entre os slides (muito mais previsível)
        const slideProgress = progress * (totalSlides - 1);
        const targetIndex = Math.min(Math.floor(slideProgress), totalSlides - 1);

        console.log('🎯 Target Index:', targetIndex, '| Slide Progress:', slideProgress.toFixed(2), '| Last Known:', lastKnownIndex);

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

// explicitamente quando chamar bootAnimations(). Isso evita conflitos de múltiplos boots. a