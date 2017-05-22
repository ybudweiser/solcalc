const assert = require('assert');
const solcalc = require('../index.js');
var moment = require('moment');

describe('solcalc', function() {
    it('should return the expected sunrise and sunset for the  day in Cleveland, irigardless of the time of day', function() {
    	var expectedTimes={
    		solarNoon:moment({ year :2017, month :5, day :21, hour :13, minute :22, second :59}),
			sunrise:moment({ year :2017, month :5, day :21, hour :6, minute :1, second :40}),
			sunset:moment({ year :2017, month :5, day :21, hour :20, minute :44, second :50})
    	};
    	var mmnt=moment("2017-05-21 4:30","YYYY-MM-DD HH:mm");
        var times = solcalc.getTimes(41.503081, -81.58916,mmnt );
        expect(times.solarNoon.isSame(expectedTimes.solarNoon));
        expect(times.sunrise.isSame(expectedTimes.sunrise));
        expect(times.sunset.isSame(expectedTimes.sunset));
        
        var mmnt2=moment("2017-05-21 23:30","YYYY-MM-DD HH:mm");
        var times2 = solcalc.getTimes(41.503081, -81.58916,mmnt2 );
        expect(times2.solarNoon.isSame(expectedTimes.solarNoon));
        expect(times2.sunrise.isSame(expectedTimes.sunrise));
        expect(times2.sunset.isSame(expectedTimes.sunset));
    });
});
