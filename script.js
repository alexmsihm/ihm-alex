const temaknapp = document.querySelector("#tema");

function bytTema() {
  document.body.classList.toggle("morkt");
  if (document.body.classList.contains("morkt")) {
    temaknapp.textContent = "Byt till ljust läge";
  } else {
    temaknapp.textContent = "Byt till mörkt läge";
  }
}

if (temaknapp) {
  temaknapp.addEventListener("click", bytTema);
}
