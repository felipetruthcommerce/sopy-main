// CONTEÚDO TEMPORÁRIO PARA O ARQUIVO minhas-animacoes.js

function bootAnimations() {
  console.log('✅ TESTE DE FOGO: A função bootAnimations foi chamada com sucesso!');
  
  // Vamos tentar animar o primeiro H1 que encontrarmos
  const primeiroTitulo = document.querySelector('h1');
  
  if (primeiroTitulo) {
    console.log('✅ TESTE DE FOGO: Encontrei o H1. Tentando animar...');
    gsap.to(primeiroTitulo, { 
      opacity: 0.5, 
      scale: 1.1, 
      duration: 2, 
      repeat: -1, 
      yoyo: true,
      ease: 'power1.inOut'
    });
  } else {
    console.error('❌ TESTE DE FOGO: Não encontrei nenhum H1 na página.');
  }
}