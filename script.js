const temaknapp = document.querySelector("#tema");
function visaTema(morkt) {
  document.body.classList.toggle("morkt", morkt);
  if (temaknapp) {
    temaknapp.textContent = morkt ? "Ljust läge" : "Mörkt läge";
    temaknapp.setAttribute("aria-pressed", String(morkt));
    temaknapp.setAttribute("aria-label", morkt ? "Byt till ljust läge" : "Byt till mörkt läge");
  }
}
let sparatTema = null;
try { sparatTema = localStorage.getItem("alex-tema"); } catch {}
visaTema(sparatTema !== "ljust");
temaknapp?.addEventListener("click", () => {
  const morkt = !document.body.classList.contains("morkt");
  visaTema(morkt);
  try { localStorage.setItem("alex-tema", morkt ? "morkt" : "ljust"); } catch {}
});

// Confine decorative light to the introduction.
const bakgrund = document.createElement("div");
bakgrund.className = "ambient-light";
bakgrund.setAttribute("aria-hidden", "true");
bakgrund.innerHTML = '<canvas class="network-canvas"></canvas>';
document.querySelector(".intro")?.prepend(bakgrund);

const tillToppen = document.createElement("a");
tillToppen.className = "back-to-top";
tillToppen.href = "#topp";
tillToppen.setAttribute("aria-label", "Till toppen");
tillToppen.innerHTML = '<span class="top-icon" aria-hidden="true">↑</span><span class="top-label">Till toppen</span>';
tillToppen.hidden = true;
const sidhuvud = document.querySelector(".sidhuvud");
sidhuvud?.insertBefore(tillToppen, temaknapp);
tillToppen.addEventListener("click", () => {
  const startsidelank = document.querySelector(".wordmark");
  startsidelank?.focus({ preventScroll: true });
});

const menylankar = [...document.querySelectorAll("nav a")];
function markeraMeny(hash) {
  document.querySelectorAll("nav a").forEach((lank) => {
    if (lank.getAttribute("href") === hash) {
      lank.setAttribute("aria-current", "location");
    } else {
      lank.removeAttribute("aria-current");
    }
  });
}
document.addEventListener("click", (event) => {
  const lank = event.target.closest("a[href^='#']");
  if (!lank || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const hash = lank.getAttribute("href");
  if (hash === "#topp") markeraMeny(null);
  else if (menylankar.some((meny) => meny.getAttribute("href") === hash)) markeraMeny(hash);
});
window.addEventListener("hashchange", () => {
  markeraMeny(location.hash === "#topp" ? null : location.hash);
});
if (location.hash && location.hash !== "#topp") markeraMeny(location.hash);

// Use the actual header height for anchor offsets and the scroll position for the menu.
const menysektioner = menylankar.map((lank) => document.querySelector(lank.getAttribute("href"))).filter(Boolean);
let menyRam = null;
function foljSkroll() {
  menyRam = null;
  const hojden = sidhuvud?.getBoundingClientRect().height || 0;
  const markor = hojden + 48;
  let aktuell = null;
  for (const sektion of menysektioner) {
    if (sektion.getBoundingClientRect().top <= markor) aktuell = `#${sektion.id}`;
  }
  if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
    aktuell = menysektioner.length ? `#${menysektioner.at(-1).id}` : null;
  }
  markeraMeny(aktuell);
  tillToppen.hidden = (document.querySelector(".intro")?.getBoundingClientRect().bottom || 0) > hojden;
  sidhuvud?.classList.toggle("is-scrolled", window.scrollY > 12);
}
function koSkroll() {
  if (menyRam === null) menyRam = requestAnimationFrame(foljSkroll);
}
if (sidhuvud) {
  new ResizeObserver(([entry]) => {
    const hojden = Math.ceil(entry.target.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-height", `${hojden}px`);
    koSkroll();
  }).observe(sidhuvud);
}
window.addEventListener("scroll", koSkroll, { passive: true });
window.addEventListener("resize", koSkroll, { passive: true });
window.addEventListener("load", koSkroll, { once: true });
document.fonts?.ready.then(koSkroll);
koSkroll();

// Reveal project evidence before the browser follows its in-page link.
function visaArbetsprov(hash) {
  if (!hash || !hash.startsWith("#")) return;
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const mal = document.getElementById(id);
  if (!mal) return;
  let del = mal.closest("details");
  while (del) {
    del.open = true;
    del = del.parentElement?.closest("details");
  }
}
document.addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const lank = event.target.closest("a[href^='#']");
  if (lank) visaArbetsprov(lank.getAttribute("href"));
});
window.addEventListener("hashchange", () => visaArbetsprov(location.hash));
visaArbetsprov(location.hash);

// The native dialog traps focus, supports Escape and restores the selected image link.
const bilddialog = document.querySelector(".image-lightbox");
const gallerilankar = [...document.querySelectorAll(".gallery-image")];
if (bilddialog && typeof bilddialog.showModal === "function") {
  const bild = bilddialog.querySelector(".lightbox-image");
  const bildtext = bilddialog.querySelector("#lightbox-caption");
  const bildnummer = bilddialog.querySelector(".lightbox-count");
  let aktivBild = 0;
  let senasteBildlank = null;
  function visaBild(index) {
    aktivBild = (index + gallerilankar.length) % gallerilankar.length;
    const lank = gallerilankar[aktivBild];
    bild.src = lank.href;
    bild.alt = lank.querySelector("img")?.alt || "";
    bildtext.textContent = lank.dataset.caption;
    bildnummer.textContent = `${aktivBild + 1} / ${gallerilankar.length}`;
  }
  gallerilankar.forEach((lank, index) => {
    lank.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      senasteBildlank = lank;
      visaBild(index);
      bilddialog.showModal();
    });
  });
  bilddialog.querySelector(".lightbox-close").addEventListener("click", () => bilddialog.close());
  bilddialog.querySelector(".lightbox-prev").addEventListener("click", () => visaBild(aktivBild - 1));
  bilddialog.querySelector(".lightbox-next").addEventListener("click", () => visaBild(aktivBild + 1));
  bilddialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      visaBild(aktivBild + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  bilddialog.addEventListener("click", (event) => {
    if (event.target !== bilddialog) return;
    const ruta = bilddialog.getBoundingClientRect();
    if (event.clientX < ruta.left || event.clientX > ruta.right || event.clientY < ruta.top || event.clientY > ruta.bottom) bilddialog.close();
  });
  bilddialog.addEventListener("close", () => senasteBildlank?.focus({ preventScroll: true }));
}

