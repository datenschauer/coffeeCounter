const clickMenuBtn = () => {
  const menu = document.querySelector(".menu");
  menu.classList.toggle("hidden");
};

const menuBtn = document.querySelector(".menu-btn");
menuBtn.addEventListener("click", clickMenuBtn);
