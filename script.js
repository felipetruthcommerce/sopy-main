function bootAnimations() {
    console.log('Iniciando reconstrução das animações...');

    // ===================================
    //  BLOCO DO FAQ (JÁ FUNCIONANDO)
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
    //  BLOCO DOS BENEFÍCIOS (CORRIGIDO)
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

        // GSAP entrance animations
        gsap.from("#beneficios .sopy-benefits-col:nth-child(1) .sopy-benefits-card", {
            scrollTrigger: {
                trigger: "#beneficios .sopy-benefits-grid",
                start: "top 80%",
                end: "center 70%",
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
                end: "center 70%",
                scrub: 0.3,
            },
            y: 50,
            x: 250,
            rotation: 20,
            opacity: 0,
            stagger: 0.2
        });

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

        // Lógica para DESKTOP (Scroll Horizontal com GSAP)
        if (window.matchMedia("(min-width: 1024px)").matches) {
            console.log('[COMO USAR] ...ativando modo Desktop.');
            const track = howSection.querySelector('.sopy-how-track');
            const panels = track ? Array.from(track.querySelectorAll('.sopy-how-panel')) : [];
            const dots = howSection.querySelectorAll('.sopy-how-progress-dot');

            if (track && panels.length > 0) {
                const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);

                gsap.to(track, {
                    x: () => -getDistance(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: howSection,
                        start: 'top top',
                        end: () => `+=${getDistance()}`,
                        pin: true,
                        scrub: 0.6,
                        invalidateOnRefresh: true,
                        onUpdate: self => {
                            if (!dots || dots.length === 0) return;
                            const steps = dots.length;
                            const idx = Math.min(steps - 1, Math.round(self.progress * (steps - 1)));
                            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
                        }
                    }
                });
            }
        }
        // Lógica para MOBILE (Slider de Toque)
        else {
            console.log('[COMO USAR] ...ativando modo Mobile.');
            const stack = howSection.querySelector('.sopy-how-stack');
            const cards = stack ? Array.from(stack.querySelectorAll('.sopy-how-mobile-card')) : [];
            const dots = howSection.querySelectorAll('.sopy-how-progress-dot');

            if (stack && cards.length > 0) {
                // (Seu código de slider de toque vai aqui, sem o DOMContentLoaded)
                // Colei e ajustei seu código abaixo:
                let currentIndex = 0;
                let isDragging = false;
                let startX = 0;
                let currentX = 0;

                const updateCardsPosition = (animate = true) => {
                    cards.forEach((card, index) => {
                        const offset = (index - currentIndex) * card.offsetWidth;
                        gsap.to(card, {
                            x: offset,
                            duration: animate ? 0.4 : 0,
                            ease: 'power2.out'
                        });
                    });
                    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
                };

                const onDragStart = (e) => {
                    isDragging = true;
                    startX = e.touches ? e.touches[0].clientX : e.clientX;
                    stack.style.cursor = 'grabbing';
                };

                const onDragMove = (e) => {
                    if (!isDragging) return;
                    currentX = e.touches ? e.touches[0].clientX : e.clientX;
                    const diff = currentX - startX;
                    cards.forEach((card, index) => {
                        const offset = (index - currentIndex) * card.offsetWidth + diff;
                        gsap.set(card, { x: offset });
                    });
                };

                const onDragEnd = () => {
                    if (!isDragging) return;
                    isDragging = false;
                    stack.style.cursor = 'grab';
                    const diff = currentX - startX;
                    if (Math.abs(diff) > 50) { // Threshold
                        if (diff < 0 && currentIndex < cards.length - 1) {
                            currentIndex++;
                        } else if (diff > 0 && currentIndex > 0) {
                            currentIndex--;
                        }
                    }
                    updateCardsPosition();
                };

                stack.addEventListener('mousedown', onDragStart);
                window.addEventListener('mousemove', onDragMove);
                window.addEventListener('mouseup', onDragEnd);
                stack.addEventListener('touchstart', onDragStart, { passive: true });
                window.addEventListener('touchmove', onDragMove);
                window.addEventListener('touchend', onDragEnd);

                updateCardsPosition(false); // Posição inicial
            }
        }
    }

    // --- Parte 2: Lógica para a Barra de Progresso Global ---
    const bar = document.querySelector('.page-progress-bar');
    if (bar && window.lenis) { // Só executa se a barra e o Lenis existirem
        console.log('[PROGRESSO] Barra de progresso da página ativada.');
        const updateProgress = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const y = window.lenis.scroll;
            const p = docHeight > 0 ? y / docHeight : 0;
            bar.style.transform = `scaleX(${p})`;
        };
        window.lenis.on('scroll', updateProgress);
    }
    
} // Fim da função bootAnimations