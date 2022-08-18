const User = require("../models/user");
const { calcPrice, formatCurrency } = require("../util/calc");
const { filterByCurrentMonth } = require("../util/functions");

exports.getUserStatus = (req, res, next) => {
  if (req.session.isLoggedIn) {
    User.findOne({ _id: req.session.user._id }).then((user) => {
      const drinks = user.drinks;
      const drinksThisMonth = filterByCurrentMonth(drinks).reduce(
        (count, obj) => count + obj.cups,
        0
      );
      res.render("status", {
        session: req.session,
        balance: formatCurrency(user.currentBalanceInCent),
        drinksThisMonth: drinksThisMonth,
      });
    });
  } else {
    res.redirect("/");
  }
};

exports.postAddCoffee = (req, res, next) => {
  if (req.session.isLoggedIn) {
    const cups = Number(req.body.coffee);
    const milk = !!req.body.milk;
    const price = calcPrice(cups, milk);
    User.findOne({ _id: req.session.user._id })
      .then((user) => {
        const currentBalance = Number(user.currentBalanceInCent);
        const currentCups = Number(user.cupsThisMonth);
        user.drinks.push({
          date: Date(),
          cups: cups,
          withMilk: milk,
          priceInCent: price,
        });
        user.cupsThisMonth = currentCups + cups;
        user.currentBalanceInCent = currentBalance + price;
        return user.save();
      })
      .then(res.redirect("/status"))
      .catch((err) => console.log(err));
  } else {
    res.redirect("/");
  }
};
