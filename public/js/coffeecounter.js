const updateCoffeeValue = (value) => {
  const coffeeAmount = document.querySelector("#coffe-amount");
  coffeeAmount.textContent = value;
};

const enableButton = () => {
  const button = document.querySelector("#coffee-btn");
  button.classList.remove("disabled");
  button.disabled = false;
};

const disableButton = () => {
  const button = document.querySelector("#coffee-btn");
  button.classList.add("disabled");
  button.disabled = true;
};

const coffeeSlider = document.querySelector("#coffee-slider");

coffeeSlider.addEventListener("input", (ev) => {
  const value = ev.target.value;
  updateCoffeeValue(value);
  value > 0 ? enableButton() : disableButton();
});
