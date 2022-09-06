'use strict';

exports.filterByCurrentMonth = function (arrayObj) {
  const currentDate = new Date();
  return arrayObj.filter((obj) => {
    return (
      obj.date.getMonth() === currentDate.getMonth() &&
      obj.date.getFullYear() === currentDate.getFullYear()
    );
  });
};

exports.getRandomInt = function (min = 0, max) {
  return Math.floor(Math.random() * (max - min) + min);
};

