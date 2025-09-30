function bootAnimations() {
    console.log('Iniciando reconstrução das animações...');

    // ===================================
    //  BLOCO DO FAQ (CORRIGIDO)
    // ===================================
    
    // ❌ A linha com 'DOMContentLoaded' foi REMOVIDA daqui.

    const allAccordions = document.querySelectorAll('#faq .sopy-faq-accordion');
    console.log(`[FAQ] Encontrados ${allAccordions.length} itens de accordion.`); // Adicionei um log para depuração

    allAccordions.forEach(accordion => {
        const titleLink = accordion.querySelector('.sopy-title a');

        if (titleLink) {
            titleLink.addEventListener('click', (event) => {
                event.preventDefault();

                // Close other open accordions
                allAccordions.forEach(acc => {
                    if (acc !== accordion && acc.classList.contains('open')) {
                        acc.classList.remove('open');
                    }
                });

                // Toggle the clicked accordion
                accordion.classList.toggle('open');
            });
        }
    });

    // ❌ O fechamento do 'DOMContentLoaded' também foi REMOVIDO.
    
    // (A sua lógica original para a animação do círculo é mais complexa, 
    // comece com esta versão simplificada de abrir/fechar. 
    // Se funcionar, podemos reintroduzir a animação do círculo depois.)
}