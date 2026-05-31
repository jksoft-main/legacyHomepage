/* app.js - Retro homepage functionality, audio synth, and state management */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Core Systems
  initThemeManager();
  initFrameResizer();
  initAccessCounter();
  initViewNavigation();
  initGuestbook();
  initChiptuneSynthesizer();
});

/* ==========================================================================
   Theme Manager
   ========================================================================== */
function initThemeManager() {
  const body = document.body;
  const rawBtn = document.getElementById("theme-raw-btn");
  const vaporBtn = document.getElementById("theme-vapor-btn");
  const win95Btn = document.getElementById("theme-win95-btn");

  // Load saved theme
  const savedTheme = localStorage.getItem("retro-theme") || "theme-raw";
  applyTheme(savedTheme);

  rawBtn.addEventListener("click", () => applyTheme("theme-raw"));
  vaporBtn.addEventListener("click", () => applyTheme("theme-vaporwave"));
  win95Btn.addEventListener("click", () => applyTheme("theme-win95"));

  function applyTheme(themeName) {
    body.className = themeName;
    localStorage.setItem("retro-theme", themeName);
    
    // Synchronize UI active state if buttons exist
    [rawBtn, vaporBtn, win95Btn].forEach(btn => btn.style.borderStyle = "outset");
    if (themeName === "theme-raw") rawBtn.style.borderStyle = "inset";
    if (themeName === "theme-vaporwave") vaporBtn.style.borderStyle = "inset";
    if (themeName === "theme-win95") win95Btn.style.borderStyle = "inset";
  }
}

/* ==========================================================================
   Simulated Frame Resizer
   ========================================================================== */
function initFrameResizer() {
  const container = document.getElementById("main-frameset");
  const menuFrame = document.getElementById("menu-frame");
  const resizeHandle = document.getElementById("resize-handle");

  let isResizing = false;

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    resizeHandle.classList.add("active");
    document.body.style.cursor = "col-resize";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    
    const containerRect = container.getBoundingClientRect();
    let newWidth = e.clientX - containerRect.left;
    
    // Boundaries checking
    if (newWidth < 180) newWidth = 180;
    if (newWidth > 350) newWidth = 350;
    
    menuFrame.style.width = `${newWidth}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove("active");
      document.body.style.cursor = "";
    }
  });
}

/* ==========================================================================
   Access Counter & Kiriban Detector
   ========================================================================== */
function initAccessCounter() {
  let count = parseInt(localStorage.getItem("access-counter-val")) || 0;
  count++;
  localStorage.setItem("access-counter-val", count);

  // Pad to 6 digits like classic counters
  const paddedCount = String(count).padStart(6, "0");
  const counterBox = document.getElementById("access-counter");
  if (counterBox) {
    counterBox.textContent = paddedCount;
  }

  // Check for Kiriban (キリ番)
  const isKiriban = checkKiriban(count);
  if (isKiriban) {
    const kiribanNotice = document.getElementById("kiriban-notice");
    if (kiribanNotice) {
      kiribanNotice.style.display = "block";
      kiribanNotice.innerHTML = `🌟 <strong>祝・キリ番獲得！</strong> 🌟<br>あなたは当サイトの <strong>${count}</strong> 番目の訪問者です！掲示板に報告してください！`;
    }
  }
}

function checkKiriban(num) {
  // A number is Kiriban if:
  // 1. Multiple of 100 (e.g. 100, 200, 1000)
  // 2. All digits are identical (e.g. 777, 888)
  // 3. Sequential numbers (e.g. 123, 1234)
  if (num < 10) return false;
  if (num % 100 === 0) return true;
  
  const numStr = String(num);
  // Identical digits check
  if (/^(\d)\1+$/.test(numStr)) return true;

  // Sequential check
  const seq = "0123456789876543210";
  if (seq.includes(numStr)) return true;

  return false;
}

/* ==========================================================================
   View Navigation
   ========================================================================== */
function initViewNavigation() {
  const navLinks = document.querySelectorAll(".menu-nav-link");
  const sections = document.querySelectorAll(".content-section");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-target");

      // Set active nav link
      navLinks.forEach(l => l.style.fontWeight = "normal");
      link.style.fontWeight = "bold";

      // Toggle active content section
      sections.forEach(section => {
        if (section.id === targetId) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
      
      // Auto scroll back to top of main content frame
      document.getElementById("content-frame").scrollTop = 0;
    });
  });
}

/* ==========================================================================
   Guestbook System
   ========================================================================== */
function initGuestbook() {
  const form = document.getElementById("gb-form");
  const list = document.getElementById("gb-list");
  
  // Default fallback posts if empty
  const defaultPosts = [
    {
      name: "管理人 (Admin)",
      message: "ホームページを開設しました！\nまだまだ未完成（工事中）ですが、ゆっくりしていってくださいね。(^-^)\nBGM機能も追加しました！左メニューから再生してみてね！",
      date: "2026/06/01 10:00"
    },
    {
      name: "通りすがり",
      message: "通りすがりです！\n阿部寛のホームページ並みに表示が早くてビックリしました！懐かしい雰囲気が最高です！\nキリ番狙います！",
      date: "2026/06/01 11:24"
    }
  ];

  loadPosts();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("gb-name");
    const msgInput = document.getElementById("gb-msg");

    const name = nameInput.value.trim() || "名無しさん";
    const message = msgInput.value.trim();

    if (!message) {
      alert("メッセージを入力してください！");
      return;
    }

    const newPost = {
      name: name,
      message: message,
      date: formatDateTime(new Date())
    };

    const posts = getStoredPosts();
    posts.unshift(newPost); // Add to top
    savePosts(posts);
    
    // Reset form and reload
    nameInput.value = "";
    msgInput.value = "";
    loadPosts();
  });

  function getStoredPosts() {
    const stored = localStorage.getItem("guestbook-posts");
    if (!stored) {
      localStorage.setItem("guestbook-posts", JSON.stringify(defaultPosts));
      return defaultPosts;
    }
    return JSON.parse(stored);
  }

  function savePosts(posts) {
    localStorage.setItem("guestbook-posts", JSON.stringify(posts));
  }

  function loadPosts() {
    const posts = getStoredPosts();
    list.innerHTML = "";

    posts.forEach(post => {
      const entry = document.createElement("div");
      entry.className = "guestbook-post win95-window";
      
      const escape = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      entry.innerHTML = `
        <div class="guestbook-header">
          <span>投稿者: <strong>${escape(post.name)}</strong></span>
          <span>時間: ${escape(post.date)}</span>
        </div>
        <div class="guestbook-body">${escape(post.message)}</div>
      `;
      list.appendChild(entry);
    });
  }

  function formatDateTime(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${y}/${m}/${d} ${hh}:${mm}`;
  }
}

/* ==========================================================================
   Web Audio API Chiptune (MIDI-like) Synthesizer
   ========================================================================== */
function initChiptuneSynthesizer() {
  const toggleBtn = document.getElementById("bgm-toggle-btn");
  const trackNameSpan = document.getElementById("bgm-track-name");

  let audioCtx = null;
  let isPlaying = false;
  let synthInterval = null;
  let currentStep = 0;

  // Retro 8-bit classic arpeggiated track (Pentatonic happy theme)
  // Notes and frequencies
  const notes = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.00, 'A4': 440.00,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00,
    'Rest': 0
  };

  const melody = [
    'E4', 'G4', 'A4', 'C5', 'A4', 'C5', 'D5', 'E5',
    'D5', 'C5', 'A4', 'G4', 'E4', 'D4', 'C4', 'Rest',
    'E4', 'Rest', 'G4', 'Rest', 'A4', 'C5', 'A4', 'G4',
    'C5', 'Rest', 'E5', 'Rest', 'D5', 'C5', 'D5', 'Rest'
  ];

  const bassline = [
    'C4', 'C4', 'E4', 'E4', 'G4', 'G4', 'A4', 'A4',
    'F4', 'F4', 'A4', 'A4', 'C5', 'C5', 'G4', 'G4',
    'C4', 'C4', 'E4', 'E4', 'G4', 'G4', 'A4', 'A4',
    'F4', 'F4', 'A4', 'A4', 'G4', 'G4', 'C4', 'Rest'
  ];

  toggleBtn.addEventListener("click", () => {
    if (isPlaying) {
      stopBGM();
    } else {
      startBGM();
    }
  });

  function startBGM() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (browser security)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    toggleBtn.textContent = "⏹️ BGM STOP";
    trackNameSpan.textContent = "Chiptune Theme: 'Welcome.mid'";
    trackNameSpan.classList.add("blink");

    currentStep = 0;
    // Play every 200ms (120 BPM sixteenth notes or similar)
    synthInterval = setInterval(playStep, 200);
  }

  function stopBGM() {
    isPlaying = false;
    toggleBtn.textContent = "▶️ BGM PLAY";
    trackNameSpan.textContent = "Stopped";
    trackNameSpan.classList.remove("blink");

    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function playStep() {
    const melodyNote = melody[currentStep % melody.length];
    const bassNote = bassline[currentStep % bassline.length];

    // Play lead synth (Square wave for retro feel)
    if (melodyNote !== 'Rest') {
      playTone(notes[melodyNote], 'square', 0.1, 0.15);
    }

    // Play bass line (Triangle wave, lower octave)
    if (bassNote !== 'Rest') {
      // Play 1 octave lower for bass
      const freq = notes[bassNote] / 2;
      playTone(freq, 'triangle', 0.15, 0.18);
    }

    // Every 4 steps, play a subtle retro noise snare sound
    if (currentStep % 4 === 2) {
      playNoiseSnare();
    }

    currentStep++;
  }

  function playTone(freq, type, volume, duration) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Fast attack, linear decay to simulate old sound card
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playNoiseSnare() {
    if (!audioCtx) return;

    const bufferSize = audioCtx.sampleRate * 0.05; // 50ms of noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill buffer with random noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter noise to sound like a snare
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
  }
}
