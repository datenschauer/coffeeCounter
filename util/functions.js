exports.filterByCurrentMonth = function (arrayObj) {
  const currentDate = new Date();
  return arrayObj.filter((obj) => {
    return (
      obj.date.getMonth() === currentDate.getMonth() &&
      obj.date.getFullYear() === currentDate.getFullYear()
    );
  });
};
