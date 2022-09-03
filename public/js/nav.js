var menuBtn = document.querySelector(".menu-btn");

const clickMenuBtn = () => {
  const menu = document.querySelector(".menu");
  menu.classList.toggle("hidden");

  if (menuBtn.firstElementChild.textContent === "menu") {
    // change to X
    menuBtn.firstElementChild.textContent = "close";
  } else {
    // change to stripes
    menuBtn.firstElementChild.textContent = "menu";
  }
};

menuBtn.addEventListener("click", clickMenuBtn);
