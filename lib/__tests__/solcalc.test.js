const solcalc = require('../index.js');
var moment = require('moment');

describe('solcalc', function () {
  it('should return the expected sunrise and sunset for the  day in Cleveland, irigardless of the time of day', function () {
    var expectedTimes = {
      solarNoon: moment({year: 2017, month: 4, day: 21, hour: 13, minute: 22, second: 59}),
      sunrise: moment({year: 2017, month: 4, day: 21, hour: 6, minute: 1, second: 40}),
      sunset: moment({year: 2017, month: 4, day: 21, hour: 20, minute: 44, second: 50})
    };
    var mmnt = moment('2017-05-21 4:30', 'YYYY-MM-DD HH:mm');
    var times = solcalc.getTimes(41.503081, -81.58916, mmnt);

    expect(times.solarNoon.isSame(expectedTimes.solarNoon, 'second')).toBeTruthy();
    expect(times.sunrise.isSame(expectedTimes.sunrise, 'second')).toBeTruthy();
    expect(times.sunset.isSame(expectedTimes.sunset, 'second')).toBeTruthy();

    var mmnt2 = moment('2017-05-21 23:30', 'YYYY-MM-DD HH:mm');
    var times2 = solcalc.getTimes(41.503081, -81.58916, mmnt2);
    expect(times2.solarNoon.isSame(expectedTimes.solarNoon, 'second')).toBeTruthy();
    expect(times2.sunrise.isSame(expectedTimes.sunrise, 'second')).toBeTruthy();
    expect(times2.sunset.isSame(expectedTimes.sunset, 'second')).toBeTruthy();
  });
  it('should return sunset for tomorrow when location is very north', function () {
    var expectedTimes = {
      solarNoon: moment({year: 2017, month: 4, day: 21, hour: 16, minute: 19, second: 22}),
      sunrise: moment({year: 2017, month: 4, day: 21, hour: 6, minute: 30, second: 57}),
      sunset: moment({year: 2017, month: 4, day: 22, hour: 2, minute: 10, second: 47})
    };
    var mmnt = moment('2017-05-21 23:30', 'YYYY-MM-DD HH:mm');
    var times = solcalc.getTimes(65.293467, -125.68359, mmnt);

    expect(times.solarNoon.isSame(expectedTimes.solarNoon, 'second')).toBeTruthy();
    expect(times.sunrise.isSame(expectedTimes.sunrise, 'second')).toBeTruthy();
    expect(times.sunset.isSame(expectedTimes.sunset, 'second')).toBeTruthy();
  });
  it('should return sunset/sunrise for next availible day when far north or south', function () {
    var expectedTimes = {
      solarNoon: moment({year: 2017, month: 4, day: 21, hour: 1, minute: 24, second: 17}),
      sunrise: moment({year: 2017, month: 4, day: 10, hour: 0, minute: 0, second: 0}),
      sunset: moment({year: 2017, month: 7, day: 2, hour: 0, minute: 0, second: 0})
    };
    var mmnt = moment('2017-05-21 23:30', 'YYYY-MM-DD HH:mm');
    var times = solcalc.getTimes(71.244355, -81.914062, mmnt);

    expect(times.solarNoon.isSame(expectedTimes.solarNoon, 'day')).toBeTruthy();
    expect(times.sunrise.isSame(expectedTimes.sunrise, 'day')).toBeTruthy();
    expect(times.sunset.isSame(expectedTimes.sunset, 'day')).toBeTruthy();
  });
});
