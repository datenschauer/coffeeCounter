'use strict';

const constants = require("../util/constants");

exports.calcPrice = function (cups, milk = false) {
  return milk
    ? (constants.PRICE_PER_CUP + constants.PRICE_FOR_MILK) * cups
    : constants.PRICE_PER_CUP * cups;
};

/**
 * Formats a number (int, no decimals!) into a string,
 * from cents to euros, where 100 cent is 1 euro.
 * Could be any other currency with this ratio 1/100.
 * -1 --> '-0,01'; 3499 --> '34,99'
 * @param cent
 * @param delimiter (default is comma)
 * @returns {string}
 */
exports.formatCurrency = function(cent, delimiter = ",") {
  const rest = Math.abs(cent % 100);
  let euro, prefix;
  if (cent < 0) {
    prefix = "-";
    euro = Math.abs(Math.ceil(cent / 100));
  } else {
    prefix = "";
    euro = Math.floor(cent / 100);
  }
  return rest === 0
    ? `${prefix}${String(euro)}`
    : rest < 10
    ? `${prefix}${String(euro)}${delimiter}0${String(rest)}`
    : `${prefix}${String(euro)}${delimiter}${String(rest)}`;
};

exports.convertStringToCent = function(string, delimiter=",") {
  let [lhs, rhs] = string.split(delimiter);
  if (!rhs) {
    return Number(lhs) * 100;
  } else if (rhs.length === 1) {
    return Number(lhs) * 100 + Number(rhs) * 10;
  } else {
    if (rhs[0] === "0") {
      return Number(lhs) * 100 + Number(rhs[1]);
    } else {
      return Number(lhs) * 100 + Number(rhs);
    }
  }
}
