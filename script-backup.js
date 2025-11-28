/* ===================================================
   SOPY LANDING PAGE - SCRIPT ORGANIZADO POR FUNCIONALIDADES
   
   RESUMO DE FUNCIONALIDADES PARA DIVISÃO MODULAR:
   
   MÓDULOS INDEPENDENTES (podem ser separados):
   - FUNCIONALIDADE 4: Botões Ripple
   - FUNCIONALIDADE 5: Animações de Texto
   - FUNCIONALIDADE 7: Bolhas 3D
   - FUNCIONALIDADE 9: Ações de Compra
   
   MÓDULOS CORE (necessários juntos):
   - FUNCIONALIDADE 1: GSAP Setup (base para tudo)
   - FUNCIONALIDADE 3: Lenis (base para scroll)
   
   MÓDULOS RELACIONADOS:
   - FUNCIONALIDADE 6 + 8: Cápsula 3D + Toggle Temas (compartilham materiais)
   
   UTILITÁRIOS:
   - FUNCIONALIDADE 2: Utils globais
   - FUNCIONALIDADE 10: Inicialização
   ==================================================== */

/* ===================================================
   FUNCIONALIDADE 1: GSAP SETUP & INICIALIZAÇÃO
   Responsável por: Configuração segura do GSAP, plugins e custom eases
   Dependências: GSAP, ScrollTrigger, CustomEase, SplitText (via CDN)
   Módulo independente: NÃO - base para outras funcionalidades
   ==================================================== */
function registerGSAPOnce() {
  if (!window.gsap || window.__gsapPluginsRegistered) return;
  const plugs = [];
  if (typeof ScrollTrigger !== "undefined") plugs.push(ScrollTrigger);
  if (typeof CustomEase !== "undefined")   plugs.push(CustomEase);
  if (typeof SplitText !== "undefined")    plugs.push(SplitText);
  if (plugs.length && typeof gsap.registerPlugin === 'function') gsap.registerPlugin(...plugs);

  // Crie as eases uma única vez
  if (typeof CustomEase !== "undefined") {
    if (!CustomEase.get("hop"))       CustomEase.create("hop",       "0.9,0,0.1,1");
    if (!CustomEase.get("osmo-ease")) CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
  }

  window.__gsapPluginsRegistered = true;
}
window.addEventListener('load', registerGSAPOnce);

/* (removido) setupOsmoWordsAnimation em favor de initMaskedTextRevealGlobal */

/* main.js â€” Sopy Landing + E-com
   Requer: gsap + ScrollTrigger + SplitText + CustomEase + lenis + three + GLTFLoader
*/

/* =========================
/* ===================================================
   FUNCIONALIDADE 2: UTILITIES GLOBAIS
   Responsável por: Funções utilitárias compartilhadas
   Dependências: Nenhuma
   Módulo independente: SIM - pode ser separado
   ==================================================== */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ===================================================
   FUNCIONALIDADE 4: BOTÕES COM EFEITO RIPPLE
   Responsável por: Efeito visual de ondulação nos botões
   Dependências: DOM
   Módulo independente: SIM - pode ser separado completamente
   ==================================================== */
function setupButtonRipples() {
  const buttons = document.querySelectorAll('.sopy-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      btn.style.setProperty("--xPos", x + "px");
      btn.style.setProperty("--yPos", y + "px");
    });
  });
}

// Inicializar ripples após DOM estar pronto
document.addEventListener('DOMContentLoaded', setupButtonRipples);





/* ===================================================
   FUNCIONALIDADE 7: BOLHAS INTERATIVAS 3D
   Responsável por: Bolhas flutuantes com física, explosões de partículas, HDRI lighting
   Dependências: Three.js, RGBELoader (opcional para HDRI)
   Módulo independente: SIM - pode ser separado completamente
   Inclui: Raycasting, particle systems, realistic materials
   ==================================================== */
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

/* ===================================================
   FUNCIONALIDADE 8: TOGGLE DE TEMAS/FRAGRÂNCIAS
   Responsável por: Troca entre temas Aqua/Citrus, atualização de materiais 3D e conteúdo
   Dependências: GSAP, Three.js materials, DOM elements
   Relacionada com: FUNCIONALIDADE 6 (para troca de modelos 3D)
   Módulo independente: PARCIAL - depende dos materiais 3D
   ==================================================== */
const toggleBtns = gsap.utils.toArray(".fragrance-toggle .toggle-option");
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

    gsap.fromTo(
      capsuleGroup.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.04, y: 1.04, z: 1.04, yoyo: true, repeat: 1, duration: 0.18, ease: "power2.inOut" }
    );
  }

  // Update product card text based on theme
  const productTitle = document.querySelector('.product-title');
  const productCopy = document.querySelector('.product-copy');
  const productPrice = document.querySelector('.product-price');
  const productCta = document.querySelector('.sopy-product-cta');
  
  if (productTitle) {
    productTitle.textContent = theme === 'citrus' ? productTitle.getAttribute('data-citrus') : productTitle.getAttribute('data-aqua');
  }
  if (productCopy) {
    productCopy.textContent = theme === 'citrus' ? productCopy.getAttribute('data-citrus') : productCopy.getAttribute('data-aqua');
  }
  if (productPrice) {
    productPrice.textContent = theme === 'citrus' ? productPrice.getAttribute('data-citrus') : productPrice.getAttribute('data-aqua');
  }
  if (productCta) {
    productCta.textContent = theme === 'citrus' ? productCta.getAttribute('data-citrus') : productCta.getAttribute('data-aqua');
  }

  // Troca o modelo 3D para o tema
  swapModel(theme);
}
toggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-active")) return;
    toggleBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const theme = btn.dataset.theme === "citrus" ? "citrus" : "aqua";
    setTheme(theme);
  });
});

// Toggle animado de produtos: troca tema do site
const productToggle = document.getElementById('product-toggle');
if (productToggle) {
  productToggle.addEventListener('change', function() {
    if (productToggle.checked) {
      document.body.classList.add('theme-aqua');
      document.body.classList.remove('theme-citrus');
    } else {
      document.body.classList.add('theme-citrus');
      document.body.classList.remove('theme-aqua');
    }
    // Se existir função setTheme/theme 3D, chame aqui
    if (typeof setTheme === 'function') {
      setTheme(productToggle.checked ? 'aqua' : 'citrus');
    }
  });
}


/* ===================================================
   FUNCIONALIDADE 9: AÇÕES DE COMPRA
   Responsável por: Handlers para botões de compra, integração com e-commerce
   Dependências: GSAP (para feedback visual), DOM
   Módulo independente: SIM - pode ser separado completamente
   Nota: Atualmente placeholder, pronto para integração Nuvemshop
   ==================================================== */
document.querySelectorAll('[data-action="sopy-buy"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".sopy-product-card");
    const sku = card?.dataset?.sku || "sopy";
    // aqui você integra com carrinho/Nuvemshop ou redireciona:
    console.log("Comprar SKU:", sku);
    gsap.fromTo(btn, { scale: 1 }, { scale: 0.96, yoyo: true, repeat: 1, duration: 0.12 });
  });
});

// Custom cursor removed: using default system cursor everywhere.


/* ===================================================
   RESUMO FINAL DE FUNCIONALIDADES PARA DIVISÃO MODULAR:
   
   MÓDULOS INDEPENDENTES (podem ser separados):
   - FUNCIONALIDADE 4: Botões Ripple
   - FUNCIONALIDADE 5: Animações de Texto
   - FUNCIONALIDADE 7: Bolhas 3D
   - FUNCIONALIDADE 9: Ações de Compra
   
   MÓDULOS CORE (necessários juntos):
   - FUNCIONALIDADE 1: GSAP Setup (base para tudo)
   - FUNCIONALIDADE 3: Lenis (base para scroll)
   
   MÓDULOS RELACIONADOS:
   - FUNCIONALIDADE 6 + 8: Cápsula 3D + Toggle Temas (compartilham materiais)
   
   UTILITÁRIOS:
   - FUNCIONALIDADE 2: Utils globais
   - FUNCIONALIDADE 10: Inicialização
   ==================================================== */



