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
visaTema(sparatTema === "morkt" || (!sparatTema && window.matchMedia("(prefers-color-scheme: dark)").matches));
temaknapp?.addEventListener("click", () => {
  const morkt = !document.body.classList.contains("morkt");
  visaTema(morkt);
  try { localStorage.setItem("alex-tema", morkt ? "morkt" : "ljust"); } catch {}
});

// Decorative light stays behind the content and never intercepts input.
const bakgrund = document.createElement("div");
bakgrund.className = "ambient-light";
bakgrund.setAttribute("aria-hidden", "true");
bakgrund.innerHTML = '<span class="ambient-orb orb-one"></span><span class="ambient-orb orb-two"></span><span class="ambient-orb orb-three"></span><span class="pointer-glow"></span>';
document.body.prepend(bakgrund);

const rorelse = window.matchMedia("(prefers-reduced-motion: reduce)");
const finPekare = window.matchMedia("(hover: hover) and (pointer: fine)");
let ljusFrame = null;
let pekarX = 50;
let pekarY = 35;
function flyttaLjus(event) {
  if (rorelse.matches || !finPekare.matches) return;
  pekarX = event.clientX;
  pekarY = event.clientY;
  if (ljusFrame !== null) return;
  ljusFrame = requestAnimationFrame(() => {
    bakgrund.style.setProperty("--pointer-x", `${pekarX}px`);
    bakgrund.style.setProperty("--pointer-y", `${pekarY}px`);
    bakgrund.classList.add("pointer-active");
    ljusFrame = null;
  });
}
window.addEventListener("pointermove", flyttaLjus, { passive: true });
function gomPekarljus() { bakgrund.classList.remove("pointer-active"); }
document.documentElement.addEventListener("pointerleave", gomPekarljus);
window.addEventListener("blur", gomPekarljus);
rorelse.addEventListener("change", gomPekarljus);
finPekare.addEventListener("change", gomPekarljus);

const tillToppen = document.createElement("a");
tillToppen.className = "back-to-top";
tillToppen.href = "#topp";
tillToppen.innerHTML = '<span aria-hidden="true">↑</span> Till toppen';
tillToppen.hidden = true;
document.body.append(tillToppen);
const toppObservator = new IntersectionObserver(([entry]) => {
  tillToppen.hidden = entry.isIntersecting;
  if (entry.isIntersecting) markeraMeny(null);
}, { threshold: 0 });
toppObservator.observe(document.querySelector(".sidhuvud"));
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

