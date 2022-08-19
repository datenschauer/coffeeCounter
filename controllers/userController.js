const User = require("../models/user");
const { calcPrice, formatCurrency } = require("../util/calc");

exports.getUserStatus = (req, res, next) => {
  User.findOne({ _id: req.session.user._id }).then((user) => {
    res.render("status", {
      balance: formatCurrency(user.currentBalanceInCent),
      cups: user.cupsSinceLastPayment,
    });
  });
};

exports.postAddCoffee = (req, res, next) => {
  const cups = Number(req.body.coffee);
  const milk = !!req.body.milk;
  const price = calcPrice(cups, milk);
  User.findOne({ _id: req.session.user._id })
    .then((user) => {
      const currentBalance = Number(user.currentBalanceInCent);
      const currentCups = Number(user.cupsSinceLastPayment);
      user.drinks.push({
        date: Date(),
        cups: cups,
        withMilk: milk,
        priceInCent: price,
      });
      user.cupsSinceLastPayment = currentCups + cups;
      user.currentBalanceInCent = currentBalance + price;
      return user.save();
    })
    .then(res.redirect("/status"))
    .catch((err) => console.log(err));
};
