'use strict';

const timeIntervals = {};

timeIntervals.MILLISECOND = 1;
timeIntervals.SECOND = timeIntervals.MILLISECOND * 1000;
timeIntervals.MINUTE = timeIntervals.SECOND * 60;
timeIntervals.HOUR = timeIntervals.MINUTE * 60;
timeIntervals.DAY = timeIntervals.HOUR * 24;
timeIntervals.WEEK = timeIntervals.DAY * 7;

exports.timeIntervals = timeIntervals;

exports.PRICE_PER_CUP = 25;

exports.PRICE_FOR_MILK = 15;

exports.TOKEN_EXPIRATION_IN_MINUTES = 30;

exports.BASE_URL = 'http://ec2-3-75-14-55.eu-central-1.compute.amazonaws.com';
// exports.BASE_URL = 'http://localhost:8000';
