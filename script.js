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
    
} // Fim da função bootAnimations