// --- WISH LIST ---
const CHRISTMAS_WISHES = [
  "Chúc bạn một mùa Giáng sinh an lành và ấm áp bên người thân yêu!",
  "Giáng sinh vui vẻ! Mong mọi điều may mắn sẽ đến với bạn trong năm 2025.",
  "Merry Christmas! Chúc bạn luôn rạng rỡ và tỏa sáng như ánh sao đêm Noel.",
  "Ting ting! Ông già Noel gửi tặng bạn ngàn nụ cười và hạnh phúc!",
  "Chúc bạn có một mùa đông không lạnh bên cạnh người thương.",
  "Mong mọi điều ước đêm nay của bạn sẽ trở thành hiện thực.",
  "Giáng sinh an lành, hạnh phúc đong đầy nhé!",
  "Chúc bạn nhận được thật nhiều quà và niềm vui trong đêm nay.",
];

function openGiftBox() {
  initDOMCache();
  const modal = DOMCache.wishModal;
  const textEl = DOMCache.wishTextContent;

  // Randomly select a wish
  const randomWish =
    CHRISTMAS_WISHES[Math.floor(Math.random() * CHRISTMAS_WISHES.length)];

  textEl.innerText = randomWish;
  modal.style.display = "flex";
  // Slight delay to trigger animation
  requestAnimationFrame(() => {
    modal.classList.add("active");
  });
}

function closeGiftBox(e) {
  initDOMCache();
  const modal = DOMCache.wishModal;
  modal.classList.remove("active");
  setTimeout(() => {
    modal.style.display = "none";
  }, 500); // Wait for fade out
}

const RESOURCES = {
  music: [
    { src: "./music/audio.mp3" },
    { src: "./music/audio1.mp3" },
    { src: "./music/audio2.mp3" },
  ],
  // Picture 3D
  photos: [
    "./images/image1.jpeg",
    "./images/image2.jpeg",
    "./images/image3.jpeg",
    "./images/image4.jpeg",
    "./images/image5.jpeg",
  ],
};

// --- ALBUM ---
const ALBUM_CONFIG = {
  maxCheck: 50, // Maximum number of images to check
  prefix: "pic",
  extension: ".jpg",
};
const ALBUM_IMAGES = [];
let albumImagesLoaded = false;

// Dynamically detect album images by checking which files exist
async function detectAlbumImages() {
  if (albumImagesLoaded) return ALBUM_IMAGES;
  
  const detectedImages = [];
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 3; // Stop after 3 consecutive failures
  
  // Helper function to check if an image exists
  const checkImageExists = (imagePath) => {
    return new Promise((resolve) => {
      const img = new Image();
      let resolved = false;
      let timeoutId;
      
      const cleanup = (result) => {
        if (!resolved) {
          resolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          // Remove event listeners to prevent memory leaks
          img.onload = null;
          img.onerror = null;
          resolve(result);
        }
      };
      
      img.onload = () => cleanup(true);
      img.onerror = () => cleanup(false);
      
      // Timeout after 800ms to avoid hanging
      timeoutId = setTimeout(() => cleanup(false), 800);
      
      img.src = imagePath;
    });
  };
  
  // Check images sequentially, stopping early if we find consecutive missing files
  for (let i = 1; i <= ALBUM_CONFIG.maxCheck; i++) {
    const imagePath = `./album/${ALBUM_CONFIG.prefix}${i}${ALBUM_CONFIG.extension}`;
    const exists = await checkImageExists(imagePath);
    
    if (exists) {
      detectedImages.push(imagePath);
      consecutiveFailures = 0; // Reset counter on success
    } else {
      consecutiveFailures++;
      // Stop checking if we hit too many consecutive failures
      if (consecutiveFailures >= maxConsecutiveFailures) {
        break;
      }
    }
  }
  
  // Update the global array
  ALBUM_IMAGES.length = 0;
  ALBUM_IMAGES.push(...detectedImages);
  
  albumImagesLoaded = true;
  console.log(`✓ Detected ${ALBUM_IMAGES.length} album image(s):`, ALBUM_IMAGES);
  return ALBUM_IMAGES;
}

// Initialize album images detection on page load
detectAlbumImages().catch(err => {
  console.warn("Album detection error:", err);
  // Fallback: try the old method if detection fails
  for (let i = 1; i <= 5; i++) {
    ALBUM_IMAGES.push(`./album/${ALBUM_CONFIG.prefix}${i}${ALBUM_CONFIG.extension}`);
  }
  albumImagesLoaded = true;
});

let bgMusic = null;
let selectedMusicIndex = 0;
const CONFIG = {
  goldCount: 2000,
  redCount: 300,
  giftCount: 150,
  explodeRadius: 65,
  photoOrbitRadius: 25,
  treeHeight: 70,
  treeBaseRadius: 35,
};

// Cache DOM elements for performance
const DOMCache = {
  loadingScreen: null,
  welcomeLayer: null,
  uiLayer: null,
  cameraWidget: null,
  exitBtn: null,
  albumOverlay: null,
  bookContainer: null,
  wishModal: null,
  wishTextContent: null,
  countdownOverlay: null,
  flashOverlay: null,
  polaroidContainer: null,
  polaroidImg: null,
  currentPhoto: null,
  pageCounter: null,
  visualizerCanvas: null,
  gestureItems: null,
  christmasCard: null,
  initialized: false
};

function initDOMCache() {
  if (DOMCache.initialized) return;
  DOMCache.loadingScreen = document.getElementById("loading-screen");
  DOMCache.welcomeLayer = document.getElementById("welcome-layer");
  DOMCache.uiLayer = document.getElementById("ui-layer");
  DOMCache.cameraWidget = document.getElementById("camera-widget");
  DOMCache.exitBtn = document.getElementById("exit-btn");
  DOMCache.albumOverlay = document.getElementById("album-overlay");
  DOMCache.bookContainer = document.getElementById("book-container");
  DOMCache.wishModal = document.getElementById("wish-modal");
  DOMCache.wishTextContent = document.getElementById("wish-text-content");
  DOMCache.countdownOverlay = document.getElementById("countdown-overlay");
  DOMCache.flashOverlay = document.getElementById("flash-overlay");
  DOMCache.polaroidContainer = document.getElementById("polaroid-container");
  DOMCache.polaroidImg = document.getElementById("polaroid-img");
  DOMCache.currentPhoto = document.getElementById("current-photo");
  DOMCache.pageCounter = document.getElementById("page-counter");
  DOMCache.visualizerCanvas = document.getElementById("visualizer-canvas");
  DOMCache.gestureItems = {
    tree: document.getElementById("icon-tree"),
    explode: document.getElementById("icon-explode"),
    heart: document.getElementById("icon-heart"),
    view: document.getElementById("icon-view"),
    photo: document.getElementById("icon-photo")
  };
  DOMCache.initialized = true;
}

// --- AUDIO VISUALIZER VARIABLES ---
let audioCtx, analyser, dataArray;
let isVisualizerReady = false;

// --- BOOK ALBUM LOGIC ---
let currentAlbumIndex = 0;
const CHRISTMAS_CARD_WISH = "Merry Christmas gia đình MIDOTA! Chúc mọi người có một đêm Noel thật 'chill' bên người thân, nhận được nhiều quà và quan trọng nhất là nạp đầy năng lượng để cùng nhau 'về đích' rực rỡ cuối năm nhé. Giáng sinh vui vẻ!";

function playBackgroundMusic() {
  if (!bgMusic) {
    bgMusic = new Audio(RESOURCES.music[selectedMusicIndex].src);
    bgMusic.crossOrigin = "anonymous";
    bgMusic.loop = true;
    bgMusic.volume = 1.0;
  } else if (bgMusic.paused) {
    // If it exists but paused, we might need to update src if selection changed
    // For simplicity, we assume selection happens before play
  }

  bgMusic
    .play()
    .then(() => {
      initAudioVisualizer();
    })
    .catch((e) => console.log("Audio play error", e));
}

async function showAlbumOverlay() {
  initDOMCache();
  
  // Ensure album images are detected before showing
  if (!albumImagesLoaded) {
    await detectAlbumImages();
  }
  
  DOMCache.albumOverlay.classList.add("show");
  DOMCache.bookContainer.classList.remove("opened");
  currentAlbumIndex = 0; // Start at first image, not Christmas card
  updateAlbumView(); // Update view with detected images

  // PLAY MUSIC IN ALBUM
  playBackgroundMusic();
}

function closeAlbumOverlay() {
  initDOMCache();
  DOMCache.albumOverlay.classList.remove("show");
  // STOP MUSIC WHEN CLOSING ALBUM (Return to menu)
  if (bgMusic) bgMusic.pause();
}

function openBook() {
  initDOMCache();
  DOMCache.bookContainer.classList.add("opened");
  updateAlbumView();
  // Audio visualizer init is handled in playBackgroundMusic now
}

function changePage(direction) {
  currentAlbumIndex += direction;
  // Allow going one page beyond the last image to show Christmas card
  if (currentAlbumIndex < 0) currentAlbumIndex = ALBUM_IMAGES.length; // Go to card
  if (currentAlbumIndex > ALBUM_IMAGES.length) currentAlbumIndex = 0; // Wrap to first image
  updateAlbumView();
}

function updateAlbumView() {
  initDOMCache();
  const photoFrame = document.getElementById("photo-frame-container");
  const christmasCard = document.getElementById("christmas-card");
  const wishText = document.getElementById("card-wish-text");
  
  // Check if we're at the Christmas card (one page after last image)
  if (currentAlbumIndex === ALBUM_IMAGES.length && ALBUM_IMAGES.length > 0) {
    // Show Christmas card
    if (photoFrame) photoFrame.style.display = "none";
    if (christmasCard) {
      christmasCard.classList.remove("christmas-card-hidden");
      christmasCard.classList.add("christmas-card-visible");
      // Set static wish
      if (wishText) {
        wishText.innerText = CHRISTMAS_CARD_WISH;
      }
    }
    if (DOMCache.pageCounter) {
      DOMCache.pageCounter.innerText = `${ALBUM_IMAGES.length + 1} / ${ALBUM_IMAGES.length + 1}`;
    }
  } else if (ALBUM_IMAGES.length > 0 && currentAlbumIndex < ALBUM_IMAGES.length) {
    // Show photo
    if (photoFrame) photoFrame.style.display = "flex";
    if (christmasCard) {
      christmasCard.classList.remove("christmas-card-visible");
      christmasCard.classList.add("christmas-card-hidden");
    }
    if (DOMCache.currentPhoto) {
      DOMCache.currentPhoto.src = ALBUM_IMAGES[currentAlbumIndex];
    }
    if (DOMCache.pageCounter) {
      DOMCache.pageCounter.innerText = `${currentAlbumIndex + 1} / ${ALBUM_IMAGES.length + 1}`;
    }
  } else {
    // Empty album
    if (DOMCache.pageCounter) {
      DOMCache.pageCounter.innerText = "Empty";
    }
  }
}

// --- AUDIO VISUALIZER SETUP ---
function initAudioVisualizer() {
  if (isVisualizerReady) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!bgMusic) return;

    const source = audioCtx.createMediaElementSource(bgMusic);
    analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    isVisualizerReady = true;
    renderVisualizer();
  } catch (e) {
    console.warn("Visualizer init warning:", e);
    if (!isVisualizerReady && audioCtx) {
      isVisualizerReady = true;
      renderVisualizer();
    }
  }
}

function renderVisualizer() {
  initDOMCache();
  const canvas = DOMCache.visualizerCanvas;
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  
  // Cache gradient colors
  const gradientCache = new Map();

  function draw() {
    requestAnimationFrame(draw);

    if (!analyser || !isVisualizerReady) return;
    
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] / 2;
      const cacheKey = Math.floor(barHeight);
      
      // Use cached gradient or create new one
      let grd = gradientCache.get(cacheKey);
      if (!grd) {
        grd = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grd.addColorStop(0, "#D32F2F");
        grd.addColorStop(1, "#FFD700");
        // Limit cache size
        if (gradientCache.size < 50) {
          gradientCache.set(cacheKey, grd);
        }
      }

      ctx.fillStyle = grd;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 2;
    }
  }
  draw();
}

// Loader
const loader = new THREE.TextureLoader();
const photoTextures = [];
let loadedCount = 0;
RESOURCES.photos.forEach((f, i) => {
  photoTextures[i] = loader.load(
    f,
    () => {
      loadedCount++;
      if (loadedCount === RESOURCES.photos.length) hideLoading();
    },
    undefined,
    () => {
      loadedCount++;
      if (loadedCount === RESOURCES.photos.length) hideLoading();
    }
  );
});
setTimeout(hideLoading, 3000);
function hideLoading() {
  initDOMCache();
  if (DOMCache.loadingScreen) {
    DOMCache.loadingScreen.style.opacity = 0;
    setTimeout(() => {
      if (DOMCache.loadingScreen) {
        DOMCache.loadingScreen.style.display = "none";
      }
    }, 500);
  }
}

// UI Logic
function selectMusic(index) {
  selectedMusicIndex = index;
  const cards = document.querySelectorAll(".music-card");
  cards.forEach((card, i) => {
    if (i === index) card.classList.add("active");
    else card.classList.remove("active");
  });
  if (bgMusic) {
    bgMusic.src = RESOURCES.music[selectedMusicIndex].src;
    if (!bgMusic.paused) bgMusic.play();
  }
}

// 3D Logic
function createCustomTexture(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const cx = 64,
    cy = 64;
  if (type === "gold_glow") {
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    grd.addColorStop(0, "#FFFFFF");
    grd.addColorStop(0.5, "#FFD700");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
  } else if (type === "red_light") {
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
    grd.addColorStop(0, "#FFAAAA");
    grd.addColorStop(0.3, "#FF0000");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
  } else if (type === "gift_red") {
    ctx.fillStyle = "#D32F2F";
    ctx.fillRect(20, 20, 88, 88);
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(54, 20, 20, 88);
    ctx.fillRect(20, 54, 88, 20);
  } else if (type === "snow") {
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
    grd.addColorStop(0, "rgba(255, 255, 255, 1)");
    grd.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}
const textures = {
  gold: createCustomTexture("gold_glow"),
  red: createCustomTexture("red_light"),
  gift: createCustomTexture("gift_red"),
  snow: createCustomTexture("snow"),
};

let scene, camera, renderer, groupGold, groupRed, groupGift, groupSnow;
let photoMeshes = [],
  titleMesh,
  starMesh,
  loveMesh;
let state = "TREE",
  selectedIndex = 0,
  handX = 0.5;
let isPhotoCooldown = false,
  isCountingDown = false;

// GLOBAL ANIMATION ID TO STOP LOOP
let animationFrameId = null;
let isCameraInitialized = false;
let cameraUtils = null;
let handsModel = null;
let cameraVideoStream = null;

function init3D() {
  const container = document.getElementById("canvas-container");

  // CLEANUP OLD CANVAS IF EXISTS
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Reset arrays and state before creating new scene
  photoMeshes = [];
  state = "TREE";
  selectedIndex = 0;
  handX = 0.5;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.002);
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 100;
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Enable render optimization
  renderer.sortObjects = false; // Disable sorting for better performance
  container.appendChild(renderer.domElement);

  groupGold = createParticleSystem("gold", CONFIG.goldCount, 2.0);
  groupRed = createParticleSystem("red", CONFIG.redCount, 3.5);
  groupGift = createParticleSystem("gift", CONFIG.giftCount, 3.0);

  createSnow();
  createPhotos();
  createDecorations();
  animate();
}

function createSnow() {
  const count = 800;
  const positions = [],
    velocities = [];
  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * 300,
      Math.random() * 200 - 100,
      (Math.random() - 0.5) * 200
    );
    velocities.push(Math.random() * 0.2 + 0.1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("velocity", new THREE.Float32BufferAttribute(velocities, 1));
  const mat = new THREE.PointsMaterial({
    size: 1.5,
    map: textures.snow,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  groupSnow = new THREE.Points(geo, mat);
  scene.add(groupSnow);
}

function createParticleSystem(type, count, size) {
  const pPositions = [],
    pExplode = [],
    pTree = [],
    pHeart = [],
    sizes = [],
    phases = [];
  for (let i = 0; i < count; i++) {
    const h = Math.random() * CONFIG.treeHeight,
      y = h - CONFIG.treeHeight / 2;
    const r =
      (1 - h / CONFIG.treeHeight) *
      CONFIG.treeBaseRadius *
      (type === "gold" ? Math.sqrt(Math.random()) : 1);
    const theta = Math.random() * Math.PI * 2;
    pTree.push(r * Math.cos(theta), y, r * Math.sin(theta));

    const phi = Math.acos(2 * Math.random() - 1),
      lam = 2 * Math.PI * Math.random();
    const rad =
      CONFIG.explodeRadius *
      Math.cbrt(Math.random()) *
      (type === "gift" ? 1.2 : 1);
    pExplode.push(
      rad * Math.sin(phi) * Math.cos(lam),
      rad * Math.sin(phi) * Math.sin(lam),
      rad * Math.cos(phi)
    );

    const tH = Math.random() * Math.PI * 2,
      rFill = Math.pow(Math.random(), 0.3);
    let hx = 16 * Math.pow(Math.sin(tH), 3) * rFill,
      hy =
        (13 * Math.cos(tH) -
          5 * Math.cos(2 * tH) -
          2 * Math.cos(3 * tH) -
          Math.cos(4 * tH)) *
        rFill;
    pHeart.push(hx * 2.2, hy * 2.2 + 5, (Math.random() - 0.5) * 8 * rFill);

    pPositions.push(pTree[i * 3], pTree[i * 3 + 1], pTree[i * 3 + 2]);
    sizes.push(size);
    phases.push(Math.random() * Math.PI * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pPositions, 3));
  geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  const colors = new Float32Array(count * 3),
    c = new THREE.Color(
      type === "gold" ? 0xffd700 : type === "red" ? 0xff0000 : 0xffffff
    );
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.userData = {
    tree: pTree,
    explode: pExplode,
    heart: pHeart,
    phases: phases,
    baseColor: c,
    baseSize: size,
  };
  const mat = new THREE.PointsMaterial({
    size: size,
    map: textures[type],
    transparent: true,
    opacity: 1.0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const p = new THREE.Points(geo, mat);
  scene.add(p);
  return p;
}

function createPhotos() {
  const geo = new THREE.PlaneGeometry(8, 8),
    borderGeo = new THREE.PlaneGeometry(9, 9),
    borderMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const photoCount = photoTextures.length;
  for (let i = 0; i < photoCount; i++) {
    if (!photoTextures[i]) continue; // Skip if texture not loaded
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        map: photoTextures[i],
        side: THREE.DoubleSide,
      })
    );
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.z = -0.1;
    mesh.add(border);
    mesh.visible = false;
    mesh.scale.set(0, 0, 0);
    scene.add(mesh);
    photoMeshes.push(mesh);
  }
}

function createDecorations() {
  const tC = document.createElement("canvas");
  tC.width = 1024;
  tC.height = 256;
  const tCtx = tC.getContext("2d");
  tCtx.font = 'bold italic 90px "Times New Roman"';
  tCtx.fillStyle = "#FFD700";
  tCtx.textAlign = "center";
  tCtx.shadowColor = "#FF0000";
  tCtx.shadowBlur = 40;
  tCtx.fillText("MERRY CHRISTMAS", 512, 130);
  titleMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 15),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(tC),
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
  );
  titleMesh.position.set(0, 50, 0);
  scene.add(titleMesh);

  const sC = document.createElement("canvas");
  sC.width = 128;
  sC.height = 128;
  const sCtx = sC.getContext("2d");
  sCtx.fillStyle = "#FFFF00";
  sCtx.shadowColor = "#FFF";
  sCtx.shadowBlur = 20;
  sCtx.beginPath();
  const cx = 64,
    cy = 64,
    outer = 50,
    inner = 20;
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outer : inner;
    sCtx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  sCtx.closePath();
  sCtx.fill();

  starMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(sC),
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
  );
  starMesh.position.set(0, CONFIG.treeHeight / 2 + 2, 0);
  scene.add(starMesh);

  const lC = document.createElement("canvas");
  lC.width = 1024;
  lC.height = 256;
  const lCtx = lC.getContext("2d");
  lCtx.font = 'bold 120px "Segoe UI"';
  lCtx.fillStyle = "#FF69B4";
  lCtx.textAlign = "center";
  lCtx.shadowColor = "#FF1493";
  lCtx.shadowBlur = 40;
  lCtx.fillText("I LOVE YOU ❤️", 512, 130);
  loveMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 18),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(lC),
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
  );
  loveMesh.position.set(0, 0, 20);
  loveMesh.visible = false;
  scene.add(loveMesh);
}

function updateSnow() {
  if (!groupSnow || !groupSnow.geometry) return;
  const positions = groupSnow.geometry.attributes.position.array;
  const velocities = groupSnow.geometry.attributes.velocity.array;
  const count = positions.length / 3;
  
  // Optimized loop with fewer array lookups
  for (let i = 0; i < count; i++) {
    const yIdx = i * 3 + 1;
    positions[yIdx] -= velocities[i];
    if (positions[yIdx] < -100) {
      positions[yIdx] = 100;
    }
  }
  groupSnow.geometry.attributes.position.needsUpdate = true;
}

function updateParticles(g, type, tState, speed, handRotY, time) {
  if (!g || !g.geometry) return;
  
  const pos = g.geometry.attributes.position.array,
    targetKey =
      tState === "TREE" ? "tree" : tState === "HEART" ? "heart" : "explode";
  const targets =
    g.geometry.userData[tState === "PHOTO_VIEW" ? "explode" : targetKey];
  
  // Optimized interpolation with smooth easing
  const len = pos.length;
  // Use slightly faster interpolation for smoother feel (min 0.08, max ~0.12)
  const smoothSpeed = Math.min(speed * 1.2, 0.12);
  for (let i = 0; i < len; i++) {
    pos[i] += (targets[i] - pos[i]) * smoothSpeed;
  }
  g.geometry.attributes.position.needsUpdate = true;

  const sizes = g.geometry.attributes.size.array,
    colors = g.geometry.attributes.color.array;
  const phases = g.geometry.userData.phases,
    baseC = g.geometry.userData.baseColor,
    baseS = g.geometry.userData.baseSize;
  
  const particleCount = pos.length / 3;

  if (tState === "TREE") {
    g.rotation.y += 0.003;
    const sinFactor = type === "red" ? 3 : 10;
    const baseBrightness = type === "red" ? 0.5 : 0.8;
    const brightnessRange = type === "red" ? 0.5 : 0.4;
    
    for (let i = 0; i < particleCount; i++) {
      sizes[i] = baseS;
      const b = baseBrightness + brightnessRange * Math.sin(time * sinFactor + phases[i]);
      const idx = i * 3;
      colors[idx] = baseC.r * b;
      colors[idx + 1] = baseC.g * b;
      colors[idx + 2] = baseC.b * b;
    }
  } else if (tState === "HEART") {
    g.rotation.y = 0;
    const scaleVal = 1 + Math.abs(Math.sin(time * 3)) * 0.15;
    g.scale.setScalar(scaleVal);
    
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      colors[idx] = baseC.r;
      colors[idx + 1] = baseC.g;
      colors[idx + 2] = baseC.b;
      sizes[i] = i % 3 === 0 ? baseS : 0;
    }
  } else {
    g.scale.setScalar(1);
    g.rotation.y -= (handX - 0.5) * 0.05;

    for (let i = 0; i < particleCount; i++) {
      sizes[i] = baseS;
      const b = 0.8 + 0.5 * Math.sin(time * 12 + phases[i]);
      const idx = i * 3;
      colors[idx] = baseC.r * b;
      colors[idx + 1] = baseC.g * b;
      colors[idx + 2] = baseC.b * b;
    }
  }
  g.geometry.attributes.color.needsUpdate = true;
  g.geometry.attributes.size.needsUpdate = true;
}

// Optimize state change detection
let lastState = null;

// Cache reusable vectors to avoid allocations in animation loop
let vec3Cache = null;

function initVec3Cache() {
  if (!vec3Cache && typeof THREE !== 'undefined') {
    vec3Cache = {
      scaleOne: new THREE.Vector3(1, 1, 1),
      scaleZero: new THREE.Vector3(0, 0, 0),
      photoTarget: new THREE.Vector3(),
      photoView: new THREE.Vector3(0, 0, 60),
      photoViewScale: new THREE.Vector3(5, 5, 5)
    };
  }
  return vec3Cache;
}

function animate() {
  animationFrameId = requestAnimationFrame(animate); // Keep ID for cancelling

  const time = Date.now() * 0.001,
    handRotY = (handX - 0.5) * 4.0;
  
  // Initialize vector cache if needed
  const vCache = initVec3Cache();
  if (!vCache) return; // THREE.js not loaded yet
  
  // Only update if groups exist
  if (groupGold) updateParticles(groupGold, "gold", state, 0.08, handRotY, time);
  if (groupRed) updateParticles(groupRed, "red", state, 0.08, handRotY, time);
  if (groupGift) updateParticles(groupGift, "gift", state, 0.08, handRotY, time);

  updateSnow();

  // Only update UI when state changes
  if (lastState !== state) {
    initDOMCache();
    if (DOMCache.gestureItems.tree) DOMCache.gestureItems.tree.classList.remove("active");
    if (DOMCache.gestureItems.explode) DOMCache.gestureItems.explode.classList.remove("active");
    if (DOMCache.gestureItems.heart) DOMCache.gestureItems.heart.classList.remove("active");
    if (DOMCache.gestureItems.view) DOMCache.gestureItems.view.classList.remove("active");
    
    if (state === "TREE" && DOMCache.gestureItems.tree) {
      DOMCache.gestureItems.tree.classList.add("active");
    } else if (state === "EXPLODE" && DOMCache.gestureItems.explode) {
      DOMCache.gestureItems.explode.classList.add("active");
    } else if (state === "HEART" && DOMCache.gestureItems.heart) {
      DOMCache.gestureItems.heart.classList.add("active");
    } else if (state === "PHOTO_VIEW" && DOMCache.gestureItems.view) {
      DOMCache.gestureItems.view.classList.add("active");
    }
    lastState = state;
  }

  // Only check textures once on initialization
  // This check can be moved outside the animation loop if textures are already loaded

  if (state === "TREE") {
    if (titleMesh) {
      titleMesh.visible = true;
      titleMesh.scale.lerp(vCache.scaleOne, 0.12);
    }
    if (starMesh) {
      starMesh.visible = true;
      starMesh.rotation.z -= 0.02;
      starMesh.material.opacity = 0.7 + 0.3 * Math.sin(time * 5);
    }
    if (loveMesh) loveMesh.visible = false;
    
    // Optimized photo mesh update
    const photoCount = photoMeshes.length;
    for (let i = 0; i < photoCount; i++) {
      const m = photoMeshes[i];
      m.scale.lerp(vCache.scaleZero, 0.12);
      m.visible = false;
    }
  } else if (state === "HEART") {
    if (titleMesh) titleMesh.visible = false;
    if (starMesh) starMesh.visible = false;
    if (loveMesh) {
      loveMesh.visible = true;
      loveMesh.scale.setScalar(1 + Math.abs(Math.sin(time * 3)) * 0.1);
    }
    
    const photoCount = photoMeshes.length;
    for (let i = 0; i < photoCount; i++) {
      photoMeshes[i].visible = false;
    }
  } else if (state === "EXPLODE") {
    if (titleMesh) titleMesh.visible = false;
    if (starMesh) starMesh.visible = false;
    if (loveMesh) loveMesh.visible = false;

    const totalPhotos = photoMeshes.length;
    const angleStep = (Math.PI * 2) / totalPhotos;
    const goldRotationY = groupGold ? groupGold.rotation.y : 0;
    let bestIdx = 0,
      maxZ = -999;

    for (let i = 0; i < totalPhotos; i++) {
      const mesh = photoMeshes[i];
      mesh.visible = true;
      const angle = goldRotationY + i * angleStep;
      const sinAngle = Math.sin(angle);
      const cosAngle = Math.cos(angle);
      const z = cosAngle * CONFIG.photoOrbitRadius;

      vCache.photoTarget.set(
        sinAngle * CONFIG.photoOrbitRadius,
        Math.sin(time + i) * 3,
        z
      );
      mesh.position.lerp(vCache.photoTarget, 0.12);
      mesh.lookAt(camera.position);

      if (z > maxZ) {
        maxZ = z;
        bestIdx = i;
      }

      const scaleVal = z > 5 ? 1 + (z / 25) * 0.8 : 0.6;
      vCache.photoTarget.set(scaleVal, scaleVal, scaleVal);
      mesh.scale.lerp(vCache.photoTarget, 0.12);
    }
    selectedIndex = bestIdx;
  } else if (state === "PHOTO_VIEW") {
    if (loveMesh) loveMesh.visible = false;
    
    const photoCount = photoMeshes.length;
    for (let i = 0; i < photoCount; i++) {
      const mesh = photoMeshes[i];
      if (i === selectedIndex) {
        mesh.position.lerp(vCache.photoView, 0.12);
        mesh.scale.lerp(vCache.photoViewScale, 0.12);
        mesh.lookAt(camera.position);
        mesh.rotation.z = 0;
      } else {
        mesh.scale.lerp(vCache.scaleZero, 0.1);
      }
    }
  }
  // Only render if scene and camera are valid
  if (scene && camera) {
    renderer.render(scene, camera);
  }
}

function triggerPhotoSequence() {
  if (isPhotoCooldown || isCountingDown) return;
  isCountingDown = true;
  initDOMCache();
  const countEl = DOMCache.countdownOverlay;
  if (!countEl) {
    isCountingDown = false;
    return;
  }
  
  let count = 3;
  countEl.style.display = "block";
  
  // Show initial count immediately
  countEl.innerText = count;
  countEl.classList.remove("count-anim");
  void countEl.offsetWidth; // Force reflow
  countEl.classList.add("count-anim");
  
  const timer = setInterval(() => {
    count--;
    
    if (count > 0) {
      // Show next count
      countEl.innerText = count;
      countEl.classList.remove("count-anim");
      void countEl.offsetWidth; // Force reflow
      countEl.classList.add("count-anim");
    } else {
      // Count reached 0, take photo
      clearInterval(timer);
      countEl.style.display = "none";
      takeWebcamPhoto();
    }
  }, 1000);
}
const stickerImg = new Image();
stickerImg.src = './log_green.png'; // Thay bằng đường dẫn file nhãn dán của bạn
stickerImg.crossOrigin = "anonymous";

function takeWebcamPhoto() {
  isPhotoCooldown = true;
  isCountingDown = false;
  initDOMCache();
  
  const flash = DOMCache.flashOverlay;
  if (flash) {
    flash.style.animation = "none";
    requestAnimationFrame(() => {
      flash.style.animation = "flashAnim 0.6s ease-out";
    });
  }
  
  try {
    const video = document.getElementsByClassName("input_video")[0];
    if (!video) return;

    const padding = 50; 
    const bottomPadding = 140; 
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth + (padding * 2);
    tempCanvas.height = video.videoHeight + padding + bottomPadding;
    const ctx = tempCanvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, tempCanvas.height);
    gradient.addColorStop(0, "#b30000");
    gradient.addColorStop(1, "#660000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * tempCanvas.width, Math.random() * tempCanvas.height, Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    ctx.translate(padding + video.videoWidth, padding);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    ctx.restore();

    if (stickerImg.complete) {
      const sWidth = video.videoWidth * 0.1; 
      const sHeight = (stickerImg.height / stickerImg.width) * sWidth;
      const xPos = tempCanvas.width - sWidth - padding - 10;
      const yPos = video.videoHeight + padding - sHeight - 10;
      ctx.drawImage(stickerImg, xPos, yPos, sWidth, sHeight);
    }

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 35px 'Courier New', monospace"; 
    ctx.textAlign = "center";
    ctx.fillText("Merry Christmas!", tempCanvas.width / 2, video.videoHeight + padding + 60);
    
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(new Date().toLocaleDateString(), tempCanvas.width / 2, video.videoHeight + padding + 100);

    const dataURL = tempCanvas.toDataURL("image/png");
    const polContainer = DOMCache.polaroidContainer;
    const polImg = DOMCache.polaroidImg;
    
    if (polImg && polContainer) {
      polImg.src = dataURL;
      polContainer.classList.remove("polaroid-anim");
      requestAnimationFrame(() => {
        polContainer.classList.add("polaroid-anim");
      });
    }

    requestAnimationFrame(() => {
      const link = document.createElement("a");
      link.download = `Xmas_Photo_${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    });

  } catch (e) {
    console.error("Capture error", e);
  }

  setTimeout(() => {
    isPhotoCooldown = false;
  }, 4000);
}
function startSystem() {
  initDOMCache();
  // Start Music
  playBackgroundMusic();

  if (DOMCache.welcomeLayer) {
    DOMCache.welcomeLayer.style.opacity = 0;
    DOMCache.welcomeLayer.style.pointerEvents = "none";
  }
  if (DOMCache.uiLayer) DOMCache.uiLayer.style.opacity = 1;
  if (DOMCache.cameraWidget) DOMCache.cameraWidget.style.opacity = 0.8;
  if (DOMCache.exitBtn) DOMCache.exitBtn.style.display = "flex";

  init3D();

  // Initialize camera (will check if already initialized)
  // Allow camera to restart if it was previously stopped
  // Small delay to ensure previous camera cleanup is complete
  setTimeout(() => {
    if (!isCameraInitialized) {
      try {
        const video = document.getElementsByClassName("input_video")[0];
        if (!video) {
          console.error("Video element not found");
          return;
        }
        
        const canvas = document.getElementById("camera-preview");
        if (!canvas) {
          console.error("Camera preview canvas not found");
          return;
        }
        
        const ctx = canvas.getContext("2d");
        handsModel = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        handsModel.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        handsModel.onResults((results) => {
      ctx.clearRect(0, 0, 100, 75);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (isCountingDown) return;
      if (results.multiHandLandmarks.length === 2) {
        const h1 = results.multiHandLandmarks[0],
          h2 = results.multiHandLandmarks[1];
        if (
          Math.hypot(h1[8].x - h2[8].x, h1[8].y - h2[8].y) < 0.15 &&
          Math.hypot(h1[4].x - h2[4].x, h1[4].y - h2[4].y) < 0.15
        ) {
          state = "HEART";
          return;
        }
      }
      if (results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        handX = lm[9].x;
        const tips = [8, 12, 16, 20],
          wrist = lm[0];
        let openDist = 0;
        tips.forEach(
          (i) => (openDist += Math.hypot(lm[i].x - wrist.x, lm[i].y - wrist.y))
        );
        const isIndexOpen = lm[8].y < lm[6].y;
        const isMiddleOpen = lm[12].y < lm[10].y;
        const isRingClosed = lm[16].y > lm[14].y;
        const isPinkyClosed = lm[20].y > lm[18].y;
        if (isIndexOpen && isMiddleOpen && isRingClosed && isPinkyClosed) {
          triggerPhotoSequence();
          if (state === "TREE") state = "EXPLODE";
        } else if (openDist / 4 < 0.25) state = "TREE";
        // Logic OK gesture (Thumb tip near Index tip)
        else if (Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y) < 0.05)
          state = "PHOTO_VIEW";
        else state = "EXPLODE";
      } else state = "TREE";
        });

        cameraUtils = new Camera(video, {
          onFrame: async () => {
            await handsModel.send({ image: video });
          },
          width: window.innerWidth < 640 ? window.innerWidth : 640, // Auto width
          height: 480,
        });
        cameraUtils.start();
        isCameraInitialized = true;
        
        // Store video stream reference for cleanup
        if (video.srcObject) {
          cameraVideoStream = video.srcObject;
        }
      } catch (error) {
        console.error("Camera initialization error:", error);
        isCameraInitialized = false;
      }
    }
  }, 200); // Small delay to ensure cleanup is complete
}

// NEW: EXIT SYSTEM FUNCTION
function exitSystem() {
  initDOMCache();
  // Show Welcome
  if (DOMCache.welcomeLayer) {
    DOMCache.welcomeLayer.style.opacity = 1;
    DOMCache.welcomeLayer.style.pointerEvents = "auto";
  }

  // Hide Interface
  if (DOMCache.uiLayer) DOMCache.uiLayer.style.opacity = 0;
  if (DOMCache.cameraWidget) DOMCache.cameraWidget.style.opacity = 0;
  if (DOMCache.exitBtn) DOMCache.exitBtn.style.display = "none";

  // Stop Music
  if (bgMusic) bgMusic.pause();

  // CLEANUP 3D LOOP
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // CLEANUP CANVAS
  const container = document.getElementById("canvas-container");
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
  
  // CLEANUP CAMERA
  try {
    // Stop MediaPipe camera utilities
    if (cameraUtils) {
      try {
        cameraUtils.stop();
      } catch (e) {
        console.warn("Camera utils stop error:", e);
      }
      cameraUtils = null;
    }
    
    // Stop MediaPipe hands model
    if (handsModel) {
      try {
        handsModel.close();
      } catch (e) {
        console.warn("Hands model close error:", e);
      }
      handsModel = null;
    }
    
    // Stop video stream tracks
    const video = document.getElementsByClassName("input_video")[0];
    if (video && video.srcObject) {
      try {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        video.srcObject = null;
      } catch (e) {
        console.warn("Video stream stop error:", e);
      }
    }
    
    // Also stop stored stream reference
    if (cameraVideoStream) {
      try {
        const tracks = cameraVideoStream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.warn("Stored stream stop error:", e);
      }
      cameraVideoStream = null;
    }
    
    // Clear camera preview canvas
    const canvas = document.getElementById("camera-preview");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset camera state to allow reinitialization
    isCameraInitialized = false;
  } catch (error) {
    console.warn("Camera cleanup error:", error);
    isCameraInitialized = false;
  }
  
  // Small delay to ensure camera resources are fully released before allowing restart
  setTimeout(() => {
    // Ensure flag is reset
    isCameraInitialized = false;
  }, 100);
  
  // Reset state tracking
  lastState = null;
}

// Throttled resize handler for better performance
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }, 100);
});
