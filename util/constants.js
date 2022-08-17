const timeIntervals = {};

timeIntervals.MILLISECOND = 1;
timeIntervals.SECOND = timeIntervals.MILLISECOND * 1000;
timeIntervals.MINUTE = timeIntervals.SECOND * 60;
timeIntervals.HOUR = timeIntervals.MINUTE * 60;
timeIntervals.DAY = timeIntervals.HOUR * 24;
timeIntervals.WEEK = timeIntervals.DAY * 7;

exports.timeIntervals = timeIntervals;