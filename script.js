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

