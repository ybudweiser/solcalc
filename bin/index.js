#!/usr/bin/env node

var moment = require('moment');
const solcalc = require('../lib/index.js');

const program = require('commander');
program.version('1.0.0')
    .description('A Javascript module used to calculate sunrise, and sunset based on the NOAA Calculations')
    .option('-l, --latitude  <n>*', 'latitude', parseFloat)
    .option('-g, --longitude  <n>*', 'longitude', parseFloat)
    .option('-d, --date [YYYY-MM-DD]', 'date in YYYY-MM-DD format, defaults to current date')
    .parse(process.argv);

if (!program.latitude || !program.longitude) {
  program.help();
}

var day = program.date === true ? moment() : moment(program.date); // Wordaround if -d flag was specified but no value
var times = solcalc.getTimes(program.latitude, program.longitude, day);
Object.keys(times).forEach(function (time) {
  console.log(time + ': ' + times[time].format('dddd, MMMM Do YYYY, h:mm:ss a'));
});
