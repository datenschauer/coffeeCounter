const clickRegion = document.querySelector("section.main");
const overlays = document.querySelectorAll(".info-overlay");

clickRegion.addEventListener("click", (ev) => {
  if (ev.target.classList.contains("info")) {
    ev.target.parentElement.firstElementChild.classList.remove("hidden");
  } else {
    overlays.forEach(el => el.classList.add("hidden"));
  }
})


