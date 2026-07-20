/* ==========================================================================
   Theme - applied immediately (script runs in <head>) to avoid a flash
   ========================================================================== */

(function initTheme() {
  let theme = localStorage.getItem("theme");
  if (theme !== "light" && theme !== "dark") theme = "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

/* ==========================================================================
   Boot
   ========================================================================== */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

document.addEventListener("DOMContentLoaded", () => {
  initSplash();
  initReveals();
  initNavScroll();
  initActiveNavLinks();
  initRoleTyping();
  initGlassSheen();
  initScrollProgress();
  initCustomCursor();
  initMagnetic();
  initTilt();
  initParallax();
  initPalette();
  initLightbox();
  initLocalClock();
  initBackToTop();
  initPartyEgg();
  initGlobalKeys();
  initStarfield();
});

/* ==========================================================================
   Starfield - Rolls-Royce starlight headliner (dark theme only via CSS)
   ========================================================================== */

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let stars = [];
  let shootingStars = [];
  let width = 0;
  let height = 0;
  let nextShootingStar = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const count = Math.floor((width * height) / 6500);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.4 + Math.random() * 1.3,
      base: 0.25 + Math.random() * 0.65,
      speed: 0.3 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      // A handful of "fiber-optic" bright stars get a soft halo
      bright: Math.random() < 0.08,
    }));
  }

  function spawnShootingStar(now) {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    shootingStars.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.35,
      vx: Math.cos(angle) * (420 + Math.random() * 240),
      vy: Math.sin(angle) * (420 + Math.random() * 240),
      life: 0,
      maxLife: 0.9 + Math.random() * 0.5,
    });
    const party = document.documentElement.classList.contains("party");
    nextShootingStar =
      now + (party ? 900 + Math.random() * 800 : 7000 + Math.random() * 9000);
  }

  let lastTime = performance.now();

  function frame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now / 1000;

    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      const alpha = s.base * twinkle;

      if (s.bright) {
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
        halo.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
        halo.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (now >= nextShootingStar) spawnShootingStar(now);

    shootingStars = shootingStars.filter((m) => m.life < m.maxLife);
    for (const m of shootingStars) {
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      const progress = m.life / m.maxLife;
      const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
      const tailX = m.x - m.vx * 0.12;
      const tailY = m.y - m.vy * 0.12;

      const trail = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      trail.addColorStop(0, "rgba(255, 255, 255, 0)");
      trail.addColorStop(1, `rgba(255, 255, 255, ${0.8 * fade})`);
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  if (prefersReducedMotion) {
    // Static night sky: draw one frame, no twinkle or shooting stars
    for (const s of stars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.base})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  nextShootingStar = performance.now() + 4000;
  requestAnimationFrame(frame);
}

/* ==========================================================================
   Scroll reveals - staggered via the --d custom property set in the HTML
   ========================================================================== */

function initReveals() {
  const targets = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((target) => observer.observe(target));
}

/* ==========================================================================
   Nav - condenses on scroll, highlights the section in view
   ========================================================================== */

function initNavScroll() {
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initActiveNavLinks() {
  const links = document.querySelectorAll(".nav__link");
  const sections = ["home", "about", "projects", "gallery", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   Hero - typewriter loop through roles
   ========================================================================== */

const ROLES = [
  "Business-First Builder",
  "Data Analyst",
  "AI Product Builder",
  "Low-Code Builder",
];

function initRoleTyping() {
  const el = document.querySelector(".hero__typed");
  if (!el) return;

  if (prefersReducedMotion) {
    el.textContent = ROLES[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const role = ROLES[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = role.slice(0, charIndex);
      if (charIndex === role.length) {
        deleting = true;
        setTimeout(tick, 2400); // hold the finished word
        return;
      }
      setTimeout(tick, 70);
    } else {
      charIndex--;
      el.textContent = role.slice(0, charIndex);
      if (charIndex === 0) {
        // Roll straight into the next word so the line never sits empty
        deleting = false;
        roleIndex = (roleIndex + 1) % ROLES.length;
        setTimeout(tick, 60);
        return;
      }
      setTimeout(tick, 22);
    }
  }

  setTimeout(tick, 900);
}

/* ==========================================================================
   Liquid glass - specular sheen follows the pointer on glass cards
   ========================================================================== */

function initGlassSheen() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".glass-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ==========================================================================
   Mobile menu
   ========================================================================== */

function openMenu() {
  document.body.classList.add("open");
}

function closeMenu() {
  document.body.classList.remove("open");
}

/* ==========================================================================
   Contact form (EmailJS)
   ========================================================================== */

async function sendEmail(event) {
  event.preventDefault();
  const body = document.body;
  const loading = document.querySelector(".contact__form__loading");
  const form = document.querySelector(".contact__form");

  try {
    loading.classList.remove("hidden");

    await emailjs.sendForm("service_k7h02th", "template_qfldt3q", event.target);

    form.reset();
    loading.classList.add("hidden");
    showToast(
      "Message Sent!",
      "Your message has been received. I'll get back to you soon!"
    );
  } catch {
    loading.classList.add("hidden");
    alert(
      "An error has occured. Please try again later or contact me at me@rosafi.io"
    );
  }
}

/* ==========================================================================
   Project filter
   ========================================================================== */

function filterProjects(category) {
  const projects = document.querySelectorAll(".project");
  const filterButtons = document.querySelectorAll(".project-filter__button");

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === category);
  });

  projects.forEach((project) => {
    const show =
      category === "all" || category === project.dataset.category;
    project.classList.toggle("project--hiding", !show);
  });
}

/* ==========================================================================
   Toast - shared by the contact form and command palette
   ========================================================================== */

let toastTimer = null;

function showToast(title, para) {
  const toast = document.querySelector(".success");
  toast.querySelector(".success__text__title").textContent = title;
  toast.querySelector(".success__text__para").textContent = para;
  document.body.classList.add("success-open");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    document.body.classList.remove("success-open");
  }, 4500);
}

/* ==========================================================================
   Intro splash - shown once per browser session
   ========================================================================== */

function initSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  if (sessionStorage.getItem("introSeen") || prefersReducedMotion) {
    splash.remove();
    return;
  }

  sessionStorage.setItem("introSeen", "1");
  setTimeout(() => {
    splash.classList.add("splash--done");
    setTimeout(() => splash.remove(), 800);
  }, 1100);
}

/* ==========================================================================
   Scroll progress bar
   ========================================================================== */

function initScrollProgress() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${progress})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

/* ==========================================================================
   Custom cursor - dot leads, ring and spotlight glow trail with lerp
   ========================================================================== */

function initCustomCursor() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    .matches;
  if (!finePointer || prefersReducedMotion) return;

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const glow = document.querySelector(".cursor-glow");
  if (!dot || !ring || !glow) return;

  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx, ry = my;
  let gx = mx, gy = my;
  let started = false;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    if (!started) {
      started = true;
      rx = gx = mx;
      ry = gy = my;
      document.body.classList.add("has-cursor");
      requestAnimationFrame(trail);
    }
  });

  function trail() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    gx += (mx - gx) * 0.06;
    gy += (my - gy) * 0.06;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(trail);
  }

  const INTERACTIVE = "a, button, .gallery-item, input, textarea, [data-cursor]";
  document.addEventListener("mouseover", (e) => {
    ring.classList.toggle("cursor-ring--hover", !!e.target.closest(INTERACTIVE));
  });
  document.addEventListener("mousedown", () =>
    ring.classList.add("cursor-ring--press")
  );
  document.addEventListener("mouseup", () =>
    ring.classList.remove("cursor-ring--press")
  );
  document.addEventListener("mouseleave", () =>
    document.body.classList.remove("has-cursor")
  );
  document.addEventListener("mouseenter", () => {
    if (started) document.body.classList.add("has-cursor");
  });
}

/* ==========================================================================
   Magnetic elements - pull gently toward the pointer
   ========================================================================== */

function initMagnetic() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const selector =
    ".btn, .hero__link, .footer__link, .theme-toggle, .nav__cmdk, .to-top, .lightbox__btn";

  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px) scale(1.04)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* ==========================================================================
   3D tilt on glass cards - pairs with the pointer-tracked sheen
   ========================================================================== */

function initTilt() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const MAX_TILT = 4;

  document.querySelectorAll(".glass-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add("is-tilting");
      card.style.transform = `perspective(1000px) rotateX(${-py * MAX_TILT}deg) rotateY(${px * MAX_TILT}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    });
  });
}

/* ==========================================================================
   Ambient parallax - background drifts opposite the pointer
   ========================================================================== */

function initParallax() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const ambient = document.querySelector(".ambient");
  const heroRow = document.querySelector(".hero__row");
  if (!ambient) return;

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;

  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  });

  (function drift() {
    cx += (tx - cx) * 0.04;
    cy += (ty - cy) * 0.04;
    ambient.style.transform = `translate(${cx * -22}px, ${cy * -22}px)`;
    if (heroRow) heroRow.style.transform = `translate(${cx * 8}px, ${cy * 8}px)`;
    requestAnimationFrame(drift);
  })();
}

/* ==========================================================================
   Command palette (⌘K / Ctrl+K)
   ========================================================================== */

const PALETTE_ACTIONS = [
  { group: "Navigate", icon: "fa-solid fa-house", label: "Go to Home", hint: "#home", run: () => scrollToSection("home") },
  { group: "Navigate", icon: "fa-solid fa-user", label: "Go to About", hint: "#about", run: () => scrollToSection("about") },
  { group: "Navigate", icon: "fa-solid fa-briefcase", label: "Go to Work", hint: "#projects", run: () => scrollToSection("projects") },
  { group: "Navigate", icon: "fa-solid fa-camera", label: "Go to Life", hint: "#gallery", run: () => scrollToSection("gallery") },
  { group: "Navigate", icon: "fa-solid fa-envelope", label: "Go to Contact", hint: "#contact", run: () => scrollToSection("contact") },
  { group: "Actions", icon: "fa-solid fa-circle-half-stroke", label: "Toggle light / dark theme", hint: "theme", run: () => toggleTheme() },
  { group: "Actions", icon: "fa-regular fa-copy", label: "Copy email address", hint: "me@rosafi.io", run: copyEmail },
  { group: "Actions", icon: "fa-solid fa-wand-magic-sparkles", label: "Party mode", hint: "surprise", run: startParty },
  { group: "Links", icon: "fa-brands fa-github", label: "Open GitHub", hint: "↗", run: () => window.open("https://github.com/mannyrosajr", "_blank") },
  { group: "Links", icon: "fa-brands fa-linkedin-in", label: "Open LinkedIn", hint: "↗", run: () => window.open("https://www.linkedin.com/in/manuelrosajr/", "_blank") },
];

let paletteIndex = 0;
let paletteFiltered = PALETTE_ACTIONS;

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText("me@rosafi.io");
    showToast("Email copied!", "me@rosafi.io is on your clipboard.");
  } catch {
    showToast("Email", "me@rosafi.io");
  }
}

function openPalette() {
  document.body.classList.add("palette-open");
  const input = document.getElementById("palette-input");
  input.value = "";
  renderPalette("");
  setTimeout(() => input.focus(), 50);
}

function closePalette() {
  document.body.classList.remove("palette-open");
}

function renderPalette(query) {
  const list = document.getElementById("palette-list");
  const q = query.trim().toLowerCase();
  paletteFiltered = PALETTE_ACTIONS.filter(
    (a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q)
  );
  paletteIndex = 0;

  if (paletteFiltered.length === 0) {
    list.innerHTML = `<div class="palette__empty">No results for “${query}”</div>`;
    return;
  }

  let html = "";
  let lastGroup = "";
  paletteFiltered.forEach((action, i) => {
    if (action.group !== lastGroup) {
      html += `<div class="palette__group">${action.group}</div>`;
      lastGroup = action.group;
    }
    html += `
      <button class="palette__item${i === 0 ? " active" : ""}" data-index="${i}">
        <i class="${action.icon}"></i>
        <span>${action.label}</span>
        <span class="palette__item__hint">${action.hint}</span>
      </button>`;
  });
  list.innerHTML = html;

  list.querySelectorAll(".palette__item").forEach((item) => {
    item.addEventListener("click", () => runPaletteAction(+item.dataset.index));
    item.addEventListener("mousemove", () => setPaletteIndex(+item.dataset.index));
  });
}

function setPaletteIndex(i) {
  paletteIndex = i;
  document.querySelectorAll(".palette__item").forEach((item) => {
    item.classList.toggle("active", +item.dataset.index === i);
  });
  const active = document.querySelector(".palette__item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function runPaletteAction(i) {
  const action = paletteFiltered[i];
  closePalette();
  if (action) setTimeout(() => action.run(), 120);
}

function initPalette() {
  const wrapper = document.getElementById("palette");
  const input = document.getElementById("palette-input");
  if (!wrapper || !input) return;

  input.addEventListener("input", () => renderPalette(input.value));

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPaletteIndex(Math.min(paletteIndex + 1, paletteFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPaletteIndex(Math.max(paletteIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runPaletteAction(paletteIndex);
    }
  });

  wrapper.addEventListener("click", (e) => {
    if (e.target === wrapper) closePalette();
  });
}

/* ==========================================================================
   Gallery lightbox
   ========================================================================== */

let lightboxPhotos = [];
let lightboxIndex = 0;

function initLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  if (items.length === 0) return;

  // The track duplicates every photo for the seamless loop - dedupe by src.
  const seen = new Set();
  lightboxPhotos = items
    .filter((item) => {
      const src = item.querySelector("img").getAttribute("src");
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    })
    .map((item) => ({
      src: item.querySelector("img").getAttribute("src"),
      caption: item.querySelector("figcaption").textContent,
    }));

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.querySelector("img").getAttribute("src");
      openLightbox(lightboxPhotos.findIndex((p) => p.src === src));
    });
  });

  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
}

function openLightbox(index) {
  lightboxIndex = Math.max(0, index);
  updateLightbox();
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  document.body.classList.remove("lightbox-open");
}

function stepLightbox(dir) {
  lightboxIndex =
    (lightboxIndex + dir + lightboxPhotos.length) % lightboxPhotos.length;
  updateLightbox();
}

function updateLightbox() {
  const photo = lightboxPhotos[lightboxIndex];
  if (!photo) return;
  const img = document.getElementById("lightbox-img");
  img.src = photo.src;
  img.alt = photo.caption;
  document.getElementById("lightbox-caption").textContent = photo.caption;
}

/* ==========================================================================
   Live local time chip
   ========================================================================== */

function initLocalClock() {
  const el = document.getElementById("local-time");
  if (!el) return;

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });

  const tick = () => {
    el.textContent = formatter.format(new Date());
  };
  tick();
  setInterval(tick, 30000);
}

/* ==========================================================================
   Back to top
   ========================================================================== */

function initBackToTop() {
  const btn = document.getElementById("to-top");
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ==========================================================================
   Party mode easter egg - 5 quick clicks on the logo (or via ⌘K)
   ========================================================================== */

let logoClicks = 0;
let logoClickTimer = null;
let partyTimer = null;

function startParty() {
  document.documentElement.classList.add("party");
  burstConfetti();
  showToast("Party mode 🎉", "Confetti's flying. Back to normal in a bit.");
  clearTimeout(partyTimer);
  partyTimer = setTimeout(() => {
    document.documentElement.classList.remove("party");
  }, 10000);
}

function burstConfetti() {
  const colors = ["#3f9dff", "#af52de", "#ff375f", "#30d158", "#ffd60a", "#ff9f0a"];
  const container = document.createElement("div");
  container.className = "confetti";

  for (let i = 0; i < 150; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti__piece";
    const size = 6 + Math.random() * 8;
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.width = size + "px";
    piece.style.height = size * (0.4 + Math.random() * 0.6) + "px";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = Math.random() * 1.2 + "s";
    piece.style.animationDuration = 2.4 + Math.random() * 2 + "s";
    piece.style.setProperty("--drift", (Math.random() * 2 - 1).toFixed(2));
    piece.style.setProperty("--spin", Math.floor(Math.random() * 900 - 450) + "deg");
    container.appendChild(piece);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 6000);
}

function initPartyEgg() {
  const logo = document.querySelector(".nav__logo");
  if (!logo) return;

  logo.addEventListener("click", () => {
    logoClicks++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => (logoClicks = 0), 1500);
    if (logoClicks >= 5) {
      logoClicks = 0;
      startParty();
    }
  });
}

/* ==========================================================================
   Global keyboard shortcuts
   ========================================================================== */

function initGlobalKeys() {
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      document.body.classList.contains("palette-open")
        ? closePalette()
        : openPalette();
      return;
    }

    if (e.key === "Escape") {
      if (document.body.classList.contains("palette-open")) closePalette();
      else if (document.body.classList.contains("lightbox-open")) closeLightbox();
      else if (document.body.classList.contains("open")) closeMenu();
      return;
    }

    if (document.body.classList.contains("lightbox-open")) {
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    }
  });
}
