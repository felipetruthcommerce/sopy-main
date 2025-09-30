function bootAnimations() {
    console.log('Iniciando reconstrução das animações...');

    // Vamos adicionar os blocos aqui um por um

    // FAQ accordion toggle functionality
    document.addEventListener('DOMContentLoaded', () => {
  const allAccordions = document.querySelectorAll('#faq .sopy-faq-accordion');

  allAccordions.forEach(accordion => {
    const titleLink = accordion.querySelector('.sopy-title a');
    
    if (titleLink) {
      titleLink.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o comportamento padr3o do link

        // click coords relative to the clicked accordion
        const rect = accordion.getBoundingClientRect();
        const clickX = event.clientX - rect.left; // px from left of card
        const clickY = event.clientY - rect.top;  // px from top of card

        // Close other open accordions toward the click point (compute coords relative to each)
        allAccordions.forEach(acc => {
          if (acc === accordion) return;
          if (acc.classList.contains('open')) {
            const r = acc.getBoundingClientRect();
            const x = event.clientX - r.left;
            const y = event.clientY - r.top;
            acc.style.setProperty('--circle-x', `${x}px`);
            acc.style.setProperty('--circle-y', `${y}px`);
            // force reflow so the CSS var is applied before starting the close animation
            // eslint-disable-next-line no-unused-expressions
            acc.offsetWidth;
            acc.classList.remove('open');
          }
        });

        const isOpen = accordion.classList.contains('open');

        // Set the click origin for the clicked accordion
        accordion.style.setProperty('--circle-x', `${clickX}px`);
        accordion.style.setProperty('--circle-y', `${clickY}px`);
        // force reflow so the CSS var is applied before toggling class
        // eslint-disable-next-line no-unused-expressions
        accordion.offsetWidth;

        if (isOpen) {
          // close this accordion toward the click point
          accordion.classList.remove('open');
        } else {
          // open this accordion from the click point
          accordion.classList.add('open');
        }
      });
    }
  });
});
}