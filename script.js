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
    //  BLOCO DOS DEPOIMENTOS (CORRIGIDO)
    // ===================================
    const testimonialsSection = document.getElementById('testemunhos'); // Corrigi o ID para 'testemunhos' que estava no seu HTML original
    if (testimonialsSection) {
        console.log('[DEPOIMENTOS] Seção encontrada. Inicializando slider...');

        const track = testimonialsSection.querySelector('.tc-testimonials-track');
        const cards = track ? Array.from(track.querySelectorAll('.tc-testimonial-card')) : [];
        const dots = testimonialsSection.querySelectorAll('.tc-testimonials-dots .tc-dot');

        if (track && cards.length > 0) {
            let currentIndex = 0;
            let isAnimating = false;
            let autoInterval;
            
            const slideTo = (index) => {
                if (isAnimating) return;
                // Faz o slider "dar a volta" (loop)
                const targetIndex = (index + cards.length) % cards.length;
                if (targetIndex === currentIndex) return;

                isAnimating = true;
                clearInterval(autoInterval); // Pausa o autoplay durante a transição

                const currentCard = cards[currentIndex];
                const targetCard = cards[targetIndex];
                const direction = targetIndex > currentIndex ? 1 : -1;
                
                // Animação com GSAP
                const tl = gsap.timeline({
                    defaults: { duration: 0.6, ease: 'power2.inOut' },
                    onComplete: () => {
                        currentIndex = targetIndex;
                        isAnimating = false;
                        startAutoPlay(); // Reinicia o autoplay
                        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
                    }
                });

                // Posiciona o próximo card fora da tela
                gsap.set(targetCard, { xPercent: direction * 100, opacity: 1, display: 'block' });
                // Anima o card atual para fora e o próximo para dentro
                tl.to(currentCard, { xPercent: -direction * 100 })
                  .to(targetCard, { xPercent: 0 }, "<");
            };
            
            // Lógica do Autoplay
            const startAutoPlay = () => {
                clearInterval(autoInterval);
                autoInterval = setInterval(() => slideTo(currentIndex + 1), 5000);
            };

            // Lógica de Arrastar (Drag)
            let isDragging = false; // A correção foi aqui
            let startX = 0;
            let deltaX = 0;

            const handleStart = (e) => {
                if (isAnimating) return;
                isDragging = true;
                startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                deltaX = 0;
                track.style.cursor = 'grabbing';
                clearInterval(autoInterval);
            };

            const handleMove = (e) => {
                if (!isDragging) return;
                const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                deltaX = currentX - startX;
                gsap.set(cards[currentIndex], { xPercent: (deltaX / track.offsetWidth) * 100 });
            };

            const handleEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                track.style.cursor = 'grab';
                startAutoPlay(); // Reinicia o autoplay

                if (Math.abs(deltaX) > track.offsetWidth * 0.2) { // Threshold de 20%
                    slideTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
                } else {
                    gsap.to(cards[currentIndex], { xPercent: 0, duration: 0.4, ease: 'power2.out' });
                }
            };
            
            // Adiciona os Event Listeners
            dots.forEach((dot, index) => dot.addEventListener('click', () => slideTo(index)));
            track.addEventListener('mousedown', handleStart);
            track.addEventListener('mousemove', handleMove);
            track.addEventListener('mouseup', handleEnd);
            track.addEventListener('mouseleave', handleEnd); // Importante para quando o mouse sai da área
            track.addEventListener('touchstart', handleStart, { passive: true });
            track.addEventListener('touchmove', handleMove);
            track.addEventListener('touchend', handleEnd);
            
            // Configuração Inicial
            cards.forEach((card, index) => {
                gsap.set(card, { xPercent: index === 0 ? 0 : 100, display: index === 0 ? 'block' : 'none' });
            });
            dots[0].classList.add('active');
            startAutoPlay();

        } else {
            console.warn('[DEPOIMENTOS] Elementos do slider (.tc-testimonials-track ou .tc-testimonial-card) não encontrados.');
        }
    } else {
        console.log('[DEPOIMENTOS] Seção #testemunhos não encontrada.');
    }



    
    
} // Fim da função bootAnimations