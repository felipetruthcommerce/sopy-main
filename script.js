function bootAnimations() {
    console.log('Iniciando reconstrução das animações...');

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
            // inserir no final da seção para manter o escopo visual
            testimonialsSection.appendChild(tcProgressWrap);
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

   // ===================================
    //  INICIALIZAÇÃO DO LENIS (SCROLL SUAVE)
    // ===================================
    // (Seu código do Lenis aqui)
    const lenis = new Lenis();
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    console.log('[LENIS] Scroll suave inicializado.');


    /* =========================
   3D Interactive Bubbles with Explosion Effects
   Creates realistic floating bubbles with click interactions and particle explosions.
   Uses Three.js with HDRI lighting for photorealistic materials.
========================= */
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



    
    // ==========================================================
    //  BLOCO FINAL: 3D E TOGGLE DE TEMA (ELES DEPENDEM UM DO OUTRO)
    // ==========================================================

    // Variáveis da cena 3D que precisam ser acessíveis por outras funções
    let gelA, gelB, gelC, capsuleGroup, COLORS; 

    // --- Função para configurar o Toggle ---
    function initThemeToggle() {
        console.log('[TOGGLE] Inicializando toggle de fragrância...');

        // Objeto de cores (coloque seus valores hexadecimais aqui)
        COLORS = {
            citrus: { a: '#ffdd00', b: '#ffaa00', c: '#ffffff' },
            aqua:   { a: '#00aaff', b: '#0077cc', c: '#ffffff' }
        };

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
            }

            // Atualiza o texto do card de produto
            const productCard = document.querySelector('.capsule-3d-cta');
            if(productCard) {
                const fields = [['.product-title', 'textContent'], ['.product-copy', 'textContent'], ['.product-price', 'textContent'], ['.sopy-product-cta', 'textContent']];
                fields.forEach(([selector, prop]) => {
                    const el = productCard.querySelector(selector);
                    if(el) el[prop] = el.getAttribute(`data-${theme}`);
                });
            }
            
            // Troca o modelo 3D (a função swapModel deve estar dentro do seu código 3D)
            if (typeof swapModel === 'function') {
                swapModel(theme);
            }
        }

        // Listeners para os botões
        const productToggle = document.getElementById('product-toggle');
        if (productToggle) {
            productToggle.addEventListener('change', function() {
                const theme = productToggle.checked ? 'aqua' : 'citrus';
                setTheme(theme);
            });
        }
        
        // Dispara o tema inicial (ex: citrus)
        setTheme('citrus'); 
    }

    // --- Função para iniciar o 3D ---
    function initThree() {
        console.log('[3D] Inicializando cena Three.js...');
        
        //
        // AQUI VAI TODO O SEU CÓDIGO DE CONFIGURAÇÃO DA CENA 3D
        // (câmera, renderer, luzes, etc.)
        //
        
        const loader = new THREE.GLTFLoader();
        
        // Dentro do seu código 3D, você terá a função que carrega/troca o modelo
        window.swapModel = function(theme) {
            const modelPath = theme === 'citrus' 
                ? 'URL_DO_SEU_MODELO_CITRUS.glb' 
                : 'URL_DO_SEU_MODELO_AQUA.glb';

            loader.load(
                modelPath,
                function (gltf) {
                    // SEU CÓDIGO que processa o modelo carregado...
                    // Exemplo:
                    // scene.add(gltf.scene);
                    // capsuleGroup = gltf.scene;
                    // gelA = gltf.scene.getObjectByName('Gel_A').material;
                    // ...etc
                    console.log(`[3D] Modelo ${theme} carregado com sucesso.`);

                    // ✅ CHAMADA CRÍTICA: Só inicia o Toggle DEPOIS que o primeiro modelo carregou
                    // Usamos uma flag para garantir que só rode uma vez
                    if (!window.themeToggleInitialized) {
                        initThemeToggle();
                        window.themeToggleInitialized = true;
                    }
                },
                undefined, // onProgress (não precisamos no momento)
                function (error) {
                    console.error('[3D] Falha ao carregar modelo:', error);
                }
            );
        };
        
        // Inicia o carregamento do primeiro modelo
        swapModel('citrus');
    }

    // Inicia o processo do 3D (que por sua vez iniciará o Toggle)
    initThree();

    
    
} // Fim da função bootAnimations