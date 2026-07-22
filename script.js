// --- Logger interno da LP: NÃO sobrescreve o console global da loja/apps. ---
// Vire SOPY_DEBUG para true para reativar os logs de depuração da landing.
const SOPY_DEBUG = false;
const sopyLog = function () { if (SOPY_DEBUG) console.log.apply(console, arguments); };
const sopyWarn = function () { if (SOPY_DEBUG) console.warn.apply(console, arguments); };

const SOPY_ASSET_BASE = (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? './assets/images/'
    : 'https://felipetruthcommerce.github.io/sopy-main/assets/images/';

// --- PRELOAD: Download capsule 2D images early so they appear instantly on scroll ---
(function () {
    var imgs = [
        SOPY_ASSET_BASE + 'sopy-capsula-2d-aqua-blu.webp',
        SOPY_ASSET_BASE + 'sopy-capsula-2d-citrus-lush.webp'
    ];
    imgs.forEach(function (src) { var i = new Image(); i.src = src; });
})();

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

// Detecta se é iOS (iPhone, iPad, iPod)
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// === VIDEO LOADING PARA MOBILE ===
// Android: WebM (12MB) | iOS: MP4 (24MB)
window.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    const isMobile = window.innerWidth < 900;
    if (!isMobile) return; // Desktop usa sources do HTML

    // URLs dos vídeos mobile
    const WEBM_URL = 'https://pub-6ab98439333c4b3da88cdddb52f2acf4.r2.dev/video_demonstrativo_vertical_site_low.webm';
    const MP4_URL = 'https://pub-4009096f9b234998870e8b50e237f762.r2.dev/video_demonstrativo_vertical_site_low.mp4';

    // Remove sources do HTML para evitar conflito
    video.querySelectorAll('source').forEach(s => s.remove());

    // Define o vídeo baseado no dispositivo
    if (isIOS()) {
        video.src = MP4_URL;
    } else {
        // Android: tenta WebM primeiro, fallback para MP4
        video.src = WEBM_URL;

        // Se WebM falhar em 5 segundos, tenta MP4
        const fallbackTimer = setTimeout(() => {
            if (video.readyState < 2) {
                video.src = MP4_URL;
                video.load();
                tryPlay();
            }
        }, 5000);

        video.addEventListener('canplay', () => clearTimeout(fallbackTimer), { once: true });
    }

    // Função para tentar reproduzir
    function tryPlay() {
        video.play().catch(() => {
            video.muted = true;
            video.play().catch(() => { });
        });
    }

    // Carrega e reproduz
    video.load();
    tryPlay();

    // Garante loop (alguns mobiles falham)
    video.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play().catch(() => { });
    });
});


function setupLenis() {
    sopyLog('[SETUP] Inicializando Lenis (Scroll Suave)...');
    // Guard: se as libs de terceiros (Lenis/GSAP/ScrollTrigger) não carregarem —
    // CDN fora do ar, CSP, ordem de injeção — não derruba o resto do bootAnimations.
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        sopyWarn('[SETUP] Lenis/GSAP/ScrollTrigger indisponível — scroll suave desativado; conteúdo permanece visível.');
        return;
    }
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
    sopyLog('[SETUP] Registrando plugins e eases do GSAP...');
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
    sopyLog('[SETUP] Configurando efeito ripple nos botões...');
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
    sopyLog('[SETUP] Inicializando animações de texto (estilo Osmo)...');

    // ... (O código do 'style' e dos seletores continua o mesmo)
    const style = document.createElement('style');
    style.textContent = `
      .split-line, .split-word { overflow: hidden !important; display: inline-block; vertical-align: top; }
      .split-line > span, .split-word > span { display: inline-block; will-change: transform; }
    `;
    document.head.appendChild(style);

    const titles = document.querySelectorAll('h1:not(#hero *), h2:not(#hero *), h3:not(#hero *), h4:not(#hero *), .tc-title, .tc-sub');
    const paragraphs = document.querySelectorAll('p:not(#hero *):not(.colon-list *), .tc-quote, .sopy-subtitle, .sopy-benefits-card-label, .sopy-footer-desc');
    const buttons = document.querySelectorAll('.sopy-btn:not(#hero *), .sopy-tc-btn:not(#hero *)');

    sopyLog(`[TEXT] Encontrados para animar: ${titles.length} títulos, ${paragraphs.length} parágrafos, ${buttons.length} botões.`);

    // ✅ VERSÃO "SUPER-DEBUG" DA FUNÇÃO
    function animateElement(element, type = 'lines') {
        if (!element || !element.textContent.trim()) {
            // sopyLog(`[DEBUG] Elemento pulado (vazio ou não existe):`, element);
            return;
        }

        // ✅ NOVO LOG: Nos diz qual elemento está sendo processado
        sopyLog(`[DEBUG] Processando elemento: <${element.tagName.toLowerCase()}> com texto "${element.textContent.substring(0, 20)}..."`);

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
                            onEnter: () => sopyLog(`✅ [TRIGGER ATIVADO] Animação de texto em: <${element.tagName.toLowerCase()}>`)
                        }
                    });
                } else {
                    sopyWarn(`[DEBUG] WARN: SplitType criou targets, mas não encontrou spans para animar em:`, element);
                }
            } else {
                sopyWarn(`[DEBUG] WARN: SplitType não criou 'lines' ou 'words' para o elemento:`, element);
            }
        } catch (e) {
            console.error(`[DEBUG] ERRO ao tentar animar o elemento:`, element, e);
        }
    }

    sopyLog('[DEBUG] --- INICIANDO PROCESSAMENTO DE TÍTULOS ---');
    titles.forEach(el => {
        if (!el.closest('#faq')) {
            animateElement(el, 'lines');
        } else {
            sopyLog(`[DEBUG] Pulando título do FAQ (intencional): "${el.textContent.substring(0, 20)}..."`);
        }
    });

    sopyLog('[DEBUG] --- INICIANDO PROCESSAMENTO DE PARÁGRAFOS ---');
    paragraphs.forEach(el => animateElement(el, 'words'));

    sopyLog('[DEBUG] --- INICIANDO PROCESSAMENTO DE BOTÕES ---');
    buttons.forEach(el => animateElement(el, 'words'));

    sopyLog("✅ Animações de texto configuradas!");
}


// ===================================
//  PARTE 2: DEFINIÇÃO DAS FUNÇÕES DO 3D E DO TOGGLE
// ===================================

// (Three.js removido — a cápsula usa imagem WebP 2D, sem WebGLRenderer nem render loop.)

// const MODELS = {
//     aqua: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509853615_aqua.glb",
//     citrus: "https://felipetruthcommerce.github.io/sopy-main/assets/models/compressed_1758509855927_citrus.glb",
// };

// const MODELS = {
//     aqua: "https://felipetruthcommerce.github.io/sopy-main/assets/models/3D-Sopy-Capsula-Azul-v024.glb",
//     citrus: "https://felipetruthcommerce.github.io/sopy-main/assets/models/3D-Sopy-Capsula-Verde-v024.glb",
// };

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
    sopyLog(`[3D] swapModel chamado para '${theme}', porém carregamento 3D foi desativado. Usando imagem 2D.`);
    // Marca tema pendente caso a inicialização da UI precise aplicar depois
    window.__pendingTheme = theme;
}

function setTheme(theme) {
    sopyLog(`[TEMA] Trocando para o tema: ${theme}`);
    document.body.classList.toggle("theme-citrus", theme === "citrus");
    document.body.classList.toggle("theme-aqua", theme === "aqua");

    // Sincroniza o estado visual do toggle com o tema atual
    try {
        const toggleEl = document.getElementById('product-toggle');
        if (toggleEl) {
            const shouldBeChecked = theme === 'aqua';
            if (toggleEl.checked !== shouldBeChecked) {
                sopyLog('[TEMA] Sync toggle → checked:', shouldBeChecked);
                toggleEl.checked = shouldBeChecked;
            }
        }
    } catch (e) {
        sopyWarn('[TEMA] Falha ao sincronizar toggle:', e);
    }

    // Atualiza a imagem do card da Sopy dependendo do tema
    try {
        const sopyCardImage = document.querySelector('.sopy-card-image');
        if (sopyCardImage) {
            const newSrc = theme === 'citrus'
                ? sopyCardImage.getAttribute('data-citrus')
                : sopyCardImage.getAttribute('data-aqua');

            if (newSrc && !sopyCardImage.src.includes(newSrc.split('/').pop())) {
                sopyLog(`[TEMA] Trocando imagem do card para ${theme}:`, newSrc);

                // Preload da imagem para evitar flicker
                const img = new Image();
                img.onload = () => {
                    fadeSwapImg(sopyCardImage, newSrc, 360);
                    sopyLog(`[TEMA] Imagem ${theme} carregada com sucesso`);
                };
                img.onerror = () => {
                    sopyWarn(`[TEMA] Erro ao carregar imagem ${theme}:`, newSrc);
                    sopyCardImage.src = newSrc;
                };
                img.src = newSrc;
            }
        }
    } catch (e) {
        sopyWarn('[TEMA] Falha ao trocar imagem do card:', e);
    }
    // Atualiza a imagem 2D da cápsula (se estiver sendo usada)
    try {
        const capsulePhoto = document.querySelector('.capsule-2d-photo');
        if (capsulePhoto) {
            const newSrc = theme === 'citrus' ? capsulePhoto.getAttribute('data-citrus') : capsulePhoto.getAttribute('data-aqua');
            if (newSrc) fadeSwapImg(capsulePhoto, newSrc, 360);
        }
    } catch (e) {
        sopyWarn('[TEMA] Falha ao trocar imagem 2D da cápsula:', e);
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
        sopyWarn('[TEMA] Falha ao atualizar imagens de benefícios:', e);
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
        sopyWarn('[TEMA] Falha ao atualizar imagens do slider:', e);
    }

    // Atualiza imagens CTA (capsule-3d-cta overlay) - MESMO PADRÃO DA SUSTENTABILIDADE
    try {
        const ctaOverlays = document.querySelectorAll('.cta-overlay');
        ctaOverlays.forEach(img => {
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
        sopyWarn('[TEMA] Falha ao atualizar imagens CTA:', e);
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
        sopyWarn('[TEMA] Falha ao atualizar textos do CTA:', e);
    }

    // Atualiza as imagens de overlay dentro de cada CTA para o tema atual
    try {
        const overlays = document.querySelectorAll('#capsula-3d .capsule-3d-cta .cta-overlay');
        if (overlays && overlays.length) {
            overlays.forEach(img => {
                const newSrc = theme === 'citrus' ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
                if (newSrc) {
                    // Force direct src update for reliability
                    img.src = newSrc;
                }
            });
        }
    } catch (e) { sopyWarn('[TEMA] Falha ao atualizar overlay images:', e); }

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
        sopyWarn('[TEMA] Falha ao atualizar imagem de fragrância:', e);
    }

    swapModel(theme);

    // Atualiza o href dos CTAs (que agora são <a>) conforme o tema — navegação nativa,
    // rastreável pelo Google e com "abrir em nova aba". Sem clonar (não destrói listeners
    // de apps/tema/pixels ligados ao elemento).
    try {
        const ctaLinks = document.querySelectorAll('.capsule-3d-cta .sopy-product-cta');
        ctaLinks.forEach(link => {
            const href = theme === 'citrus' ? link.getAttribute('data-href-citrus') : link.getAttribute('data-href-aqua');
            if (href) link.setAttribute('href', href);
        });
    } catch (e) { sopyWarn('[TEMA] Falha ao atualizar href dos CTAs:', e); }
}

// ===================================================
// FUNCIONALIDADE: BOLHAS INTERATIVAS 3D
// Bolhas flutuantes com física, explosões de partículas, HDRI lighting
// ===================================================

function initCapsuleBubbles() {
    const container = document.querySelector('.sopy-capsule-bubbles');
    if (!container) return;
    if (container.__bubblesInitialized) return;
    container.__bubblesInitialized = true;

    const bubbles = container.querySelectorAll('.sopy-bubble');

    // Define posição e timing uma única vez — sem listeners, sem modificações em runtime
    // Com 20 bolhas em velocidades diferentes, a variação natural é suficiente
    bubbles.forEach(function(el) {
        var dur     = 7 + Math.random() * 5;       // 7–12s por ciclo
        var shimmer = 3 + Math.random() * 3;       // 3–6s shimmer
        var delay   = -(Math.random() * dur);      // negativo = já em movimento ao carregar

        var maxLeft = window.innerWidth <= 768 ? 75 : 90;
        el.style.left              = (Math.random() * maxLeft) + '%';
        el.style.bottom            = (Math.random() * 75) + '%';
        el.style.animationDuration = dur + 's, ' + shimmer + 's';
        el.style.animationDelay    = delay + 's, 0s';
    });
}

// ===================================================
// Atualiza a imagem da seção "Fragrâncias da alta perfumaria" conforme o tema
// Procura a seção pelo título e troca o `src` do elemento <video> ou <img>
// ===================================================
function updateFragranceImage(theme) {
    try {
        const FRAGRANCE_BASE = SOPY_ASSET_BASE;
        const FILES = {
            citrus: 'sopy-fragrancia-citrus-lush.webp',
            aqua: 'sopy-fragrancia-aqua-blu.webp'
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
                sopyLog('[TEMA] Imagem de fragrância atualizada para', theme, newSrc);
            } catch (e) {
                sopyWarn('[TEMA] Erro ao aplicar imagem de fragrância:', e);
            }
        };
        img.onerror = () => {
            sopyWarn('[TEMA] Erro ao carregar imagem de fragrância:', newSrc);
        };
        img.src = newSrc;
    } catch (e) {
        sopyWarn('[TEMA] updateFragranceImage falhou:', e);
    }
}


// Interações da seção da cápsula: giro da foto 2D no scroll + cards de produto.
// O modelo 3D (Three.js) foi removido — a cápsula agora é uma imagem WebP 2D.
function initCapsuleInteractions() {
    const threeWrap = document.getElementById("three-container");
    if (!threeWrap || threeWrap.__initialized) return;
    threeWrap.__initialized = true;

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
                img.setAttribute('data-aqua', SOPY_ASSET_BASE + 'sopy-capsula-2d-aqua-blu.webp');
                img.setAttribute('data-citrus', SOPY_ASSET_BASE + 'sopy-capsula-2d-citrus-lush.webp');
                img.alt = 'Cápsula Sopy';
                // define src inicial baseado na classe do body
                img.src = document.body.classList.contains('theme-citrus') ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
                threeContainer.appendChild(img);
            }
        } catch (e) {
            sopyWarn('[3D->2D] Falha ao injetar imagem 2D:', e);
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

            // normaliza o progresso p para o intervalo [SPIN_START..SPIN_END]
            let t = (p - SPIN_START) / (SPIN_END - SPIN_START);
            t = Math.max(0, Math.min(1, t)); // clamp 0..1

            // faz exatamente 360° nesse intervalo e PARA (foto 2D animada via CSS)
            const photoEl = document.querySelector('.capsule-2d-photo');
            if (photoEl) {
                const deg = t * 360; // 0..360 graus
                photoEl.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
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
                    // OTIMIZADO: Espalha o trabalho em múltiplos frames para evitar travadas

                    // Frame 1: Classes básicas (leve)
                    ctas.forEach(c => c.classList.add('at-end'));

                    // Frame 2: Esconder 3D (próximo frame)
                    requestAnimationFrame(() => {
                        const three = document.getElementById('three-container');
                        const bubbles = document.querySelector('.sopy-capsule-bubbles');
                        if (three) three.classList.add('hide-3d');
                        if (bubbles) bubbles.classList.add('hide-3d');

                        // Frame 3: Fade da foto 2D e mostrar overlays (próximo frame)
                        requestAnimationFrame(() => {
                            const section = document.getElementById('capsula-3d');
                            const photo = document.querySelector('.capsule-2d-photo');

                            if (photo) {
                                photo.style.transition = 'opacity .32s ease';
                                photo.style.opacity = '0';
                            }

                            // Frame 4: Mostrar overlays (próximo frame)
                            requestAnimationFrame(() => {
                                if (!section) return;
                                const theme = document.body.classList.contains('theme-citrus') ? 'citrus' : 'aqua';
                                const overlays = section.querySelectorAll('.capsule-3d-cta .cta-overlay');

                                if (!overlays || overlays.length === 0) {
                                    section.classList.add('show-overlays');
                                    return;
                                }

                                // Como as imagens já foram pré-carregadas, apenas atualiza o src
                                overlays.forEach(img => {
                                    const newSrc = theme === 'citrus' ? img.getAttribute('data-citrus') : img.getAttribute('data-aqua');
                                    if (newSrc && (!img.src || !img.src.includes(newSrc.split('/').pop()))) {
                                        img.src = newSrc;
                                    }
                                });

                                // Frame 5: Revelar overlays suavemente
                                requestAnimationFrame(() => {
                                    section.classList.add('show-overlays');
                                    overlays.forEach(img => {
                                        img.style.visibility = 'visible';
                                        img.style.transition = 'opacity .32s ease, transform .32s ease';
                                        img.style.opacity = '1';
                                    });
                                });
                            });
                        });
                    });
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


}








function bootAnimations() {
    sopyLog('Iniciando reconstrução das animações...');

    // One-time guard to prevent double initialization
    if (window.__sopyBooted) return;
    window.__sopyBooted = true;

    sopyLog('[TEMA] Aplicando tema inicial (apenas se não houver tema)');
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
        sopyLog('[TEMA] Toggle encontrado, estado inicial checked =', productToggle.checked);
        productToggle.addEventListener('change', () => {
            const newTheme = productToggle.checked ? 'aqua' : 'citrus';
            sopyLog('[TEMA] Toggle change →', { checked: productToggle.checked, newTheme });
            setTheme(newTheme);
        });
        // Aplica o tema inicial baseado no estado do toggle ou body
        const initialTheme = document.body.classList.contains('theme-aqua') ? 'aqua' : 'citrus';
        setTheme(initialTheme);
    } else {
        sopyWarn('[TEMA] Toggle #product-toggle não encontrado!');
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
                sopyLog('[HERO] Garantindo a remoção do poster.');
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
        sopyLog('[PARALLAX] Seção #sustentabilidade encontrada. Inicializando efeito.');

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
        sopyWarn('[PARALLAX] Seção #sustentabilidade ou Lenis não encontrados.');
    }



    // ===================================
    //  BLOCO DO FAQ
    // ===================================
    const allAccordions = document.querySelectorAll('#faq .sopy-faq-accordion');
    sopyLog(`[FAQ] Encontrados ${allAccordions.length} itens de accordion.`);

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

    // (Removidos: initCardImage — redundante, setTheme() já troca a .sopy-card-image por tema;
    //  e initBenefitsAnimations — estava desativada, corpo comentado, só fazia return.)



    // ===================================
    //  BLOCO DOS DEPOIMENTOS 
    // ===================================
    const testimonialsSection = document.getElementById('testemunhos');
    if (testimonialsSection) {
        sopyLog('[DEPOIMENTOS] Seção encontrada. Inicializando slider...');

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

        // (Avatares por iniciais no HTML — não injetamos mais fotos de terceiros.)

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

            // Pausa o autoplay quando a seção não está visível, retoma quando volta
            new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    startAutoPlay();
                } else {
                    clearInterval(autoInterval);
                }
            }, { threshold: 0.3 }).observe(testimonialsSection);

            // Dots sempre visíveis 100% do tempo
            tcProgressWrap.classList.add('visible');
            // Força estilo inline para garantir que nunca suma
            tcProgressWrap.style.opacity = '1';
            tcProgressWrap.style.pointerEvents = 'auto';

        } else {
            sopyWarn('[DEPOIMENTOS] Elementos do slider (.tc-testimonials-track ou .tc-testimonial-card) não encontrados.');
        }
    } else {
        sopyLog('[DEPOIMENTOS] Seção #testemunhos não encontrada.');
    }

    // 3. Inicializador da seção da cápsula (Lazy Load) — sem Three.js
    const capsuleSection = document.getElementById("capsula-3d");
    if (capsuleSection) {
        new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                observer.unobserve(capsuleSection);
                initCapsuleInteractions();
                initCapsuleBubbles();
            }
        }, { threshold: 0.1 }).observe(capsuleSection);
    }


    // 4. Após montar seções com pin, iniciamos os reveals de texto, depois refresh geral
    try {
        initTextAnimations();
    } catch (e) { console.error('[BOOT] Erro ao iniciar reveals:', e); }

    setTimeout(() => {
        if (window.ScrollTrigger) {
            sopyLog('✅ Forçando refresh final do ScrollTrigger.');
            ScrollTrigger.refresh();
        }
    }, 200);



} // Fim da função bootAnimations

// Observação: a inicialização automática foi removida para permitir que o host controle

// ========== SLIDER FULLSCREEN ==========
(function initSlider() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
        return;
    }
    (function () {
    "use strict";

    /* refs - todos escopados dentro da seção correta para evitar conflito com outros sliders */
    const section = document.querySelector(".slider-fullscreen-section");
    if (!section) { sopyWarn('[SLIDER] section não encontrada'); return; }

    const track = section.querySelector(".slider-slide");
    const btnNext = section.querySelector(".slider-next");
    const btnPrev = section.querySelector(".slider-prev");
    const btnContainer = section.querySelector(".slider-button");

    if (!track || !btnNext || !btnPrev || !btnContainer) {
        sopyWarn('[SLIDER] Elementos internos não encontrados');
        return;
    }

    let currentIndex = 0;
    const totalSlides = track.querySelectorAll(".slider-item").length;
    let isTransitioning = false;


    /* HELPER: Verifica se a seção está 100% visível para permitir slide changes */
    function isSliderActive() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;

        // A seção é considerada ativa APENAS quando está 100% na viewport:
        // - O topo da seção deve estar no topo ou acima (-20px tolerância)
        // - A base da seção deve estar na base ou abaixo (+20px tolerância)
        return rect.top <= 20 && rect.bottom >= vh - 20;
    }

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

    /* VISIBILIDADE DOS BOTÕES - IntersectionObserver é mais confiável que scroll event */
    const btnObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            btnContainer.style.opacity = entry.isIntersecting ? '1' : '0';
            btnContainer.style.pointerEvents = entry.isIntersecting ? 'auto' : 'none';
        });
    }, { threshold: 0.1 });
    btnObserver.observe(section);

    function updateButtonsVisibility() { /* mantido para compatibilidade, agora é no-op */ }

    /* SCROLL PROGRESS - sistema melhorado */
    let lastKnownIndex = 0;
    let ticking = false;

    // ✨ AUMENTA A ALTURA VIRTUAL DA SEÇÃO PARA TORNAR O SCROLL MAIS LENTO
    const SCROLL_MULTIPLIER = 1; // Ajustado para 1 para corrigir bug do iOS (antes 1.5 impedia chegar ao fim)

    function updateSlideByScroll() {
        // MOBILE: desativa scroll-jacking (apenas setas/swipe)
        if (window.innerWidth <= 900) {
            ticking = false;
            return;
        }

        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Só atua quando a seção está SIGNIFICATIVAMENTE na viewport
        // Verifica se pelo menos 60% da seção está visível
        const sectionVisibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibilityRatio = sectionVisibleHeight / sectionHeight;

        // Só atua se a seção está na viewport E o topo já passou
        if (sectionTop > viewportHeight * 0.5 || rect.bottom < viewportHeight * 0.3 || visibilityRatio < 0.1) {
            ticking = false;
            return;
        }

        // Total "scrollable" MULTIPLICADO para tornar o scroll mais lento
        const baseScrollable = Math.max(sectionHeight - viewportHeight, 1);
        const totalScrollable = baseScrollable * SCROLL_MULTIPLIER;

        // Progresso normalizado (0..1) mas agora com área de scroll ampliada
        const scrolled = -Math.min(Math.max(sectionTop, -totalScrollable), 0);
        const progress = scrolled / totalScrollable;

        // LOGS DETALHADOS (só monta o objeto se o debug estiver ligado — hot path por frame)
        if (SOPY_DEBUG) {
            sopyLog('📊 SLIDER DEBUG:', {
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
        }

        // Divisão LINEAR simples entre os slides (muito mais previsível)
        const slideProgress = progress * (totalSlides - 1);
        const targetIndex = Math.min(Math.floor(slideProgress), totalSlides - 1);

        sopyLog('🎯 Target Index:', targetIndex, '| Slide Progress:', slideProgress.toFixed(2), '| Last Known:', lastKnownIndex);

        // Só muda se passou para outro índice
        if (targetIndex !== lastKnownIndex && !isTransitioning) {
            const diff = targetIndex - lastKnownIndex;

            sopyLog('🔄 Mudando slide! Diff:', diff);

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
        if (!isSliderActive()) return;

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
        if (!isSliderActive()) return;
        // não sequestrar o teclado quando o usuário digita num campo (busca, cupom, CEP…)
        if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;

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
        if (!isSliderActive()) return;

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

    // Inicializa classe do último slide
    updateLastSlideClass();

    })();
})();

// explicitamente quando chamar bootAnimations(). Isso evita conflitos de múltiplos boots. a
