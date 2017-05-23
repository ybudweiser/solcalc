'use strict';
var moment = require('moment');
var Julian = require('julian-date');

function calcTimeJulianCent(jd) {
  var T = (jd - 2451545.0) / 36525.0;
  return T;
}

function isLeapYear(yr) {
  return ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0);
}

function calcDoyFromJD(jd) {
  var z = Math.floor(jd + 0.5);
  var f = (jd + 0.5) - z;
  var A;
  if (z < 2299161) {
    A = z;
  } else {
    var alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  var B = A + 1524;
  var C = Math.floor((B - 122.1) / 365.25);
  var D = Math.floor(365.25 * C);
  var E = Math.floor((B - D) / 30.6001);
  var day = B - D - Math.floor(30.6001 * E) + f;
  var month = (E < 14) ? E - 1 : E - 13;
  var year = (month > 2) ? C - 4716 : C - 4715;

  var k = (isLeapYear(year) ? 1 : 2);
  var doy = Math.floor((275 * month) / 9) - (k * Math.floor((month + 9) / 12)) + day - 30;
  return doy;
}

function radToDeg(angleRad) {
  return (180.0 * angleRad / Math.PI);
}

function degToRad(angleDeg) {
  return (Math.PI * angleDeg / 180.0);
}

function calcGeomMeanLongSun(t) {
  var L0 = 280.46646 + (t * (36000.76983 + (t * (0.0003032))));
  while (L0 > 360.0) {
    L0 -= 360.0;
  }
  while (L0 < 0.0) {
    L0 += 360.0;
  }
  return L0; // In degrees
}

function calcGeomMeanAnomalySun(t) {
  var M = 357.52911 + (t * (35999.05029 - (0.0001537 * t)));
  return M; // In degrees
}

function calcEccentricityEarthOrbit(t) {
  var e = 0.016708634 - (t * (0.000042037 + (0.0000001267 * t)));
  return e; // Unitless
}

function calcSunEqOfCenter(t) {
  var m = calcGeomMeanAnomalySun(t);
  var mrad = degToRad(m);
  var sinm = Math.sin(mrad);
  var sin2m = Math.sin(mrad + mrad);
  var sin3m = Math.sin(mrad + mrad + mrad);
  var C = (sinm * (1.914602 - (t * (0.004817 + (0.000014 * t))))) + (sin2m * (0.019993 - (0.000101 * t))) + (sin3m * 0.000289);
  return C; // In degrees
}

function calcSunTrueLong(t) {
  var l0 = calcGeomMeanLongSun(t);
  var c = calcSunEqOfCenter(t);
  var O = l0 + c;
  return O; // In degrees
}

function calcSunTrueAnomaly(t) {
  var m = calcGeomMeanAnomalySun(t);
  var c = calcSunEqOfCenter(t);
  var v = m + c;
  return v; // In degrees
}

function calcSunRadVector(t) {
  var v = calcSunTrueAnomaly(t);
  var e = calcEccentricityEarthOrbit(t);
  var R = (1.000001018 * (1 - (e * e))) / (1 + (e * Math.cos(degToRad(v))));
  return R; // In AUs
}

function calcSunApparentLong(t) {
  var o = calcSunTrueLong(t);
  var omega = 125.04 - (1934.136 * t);
  var lambda = o - 0.00569 - (0.00478 * Math.sin(degToRad(omega)));
  return lambda; // In degrees
}

function calcMeanObliquityOfEcliptic(t) {
  var seconds = 21.448 - (t * (46.8150 + ((t * 0.00059) - (t * 0.001813))));
  var e0 = 23.0 + ((26.0 + (seconds / 60.0)) / 60.0);
  return e0; // In degrees
}

function calcObliquityCorrection(t) {
  var e0 = calcMeanObliquityOfEcliptic(t);
  var omega = 125.04 - (1934.136 * t);
  var e = e0 + (0.00256 * Math.cos(degToRad(omega)));
  return e; // In degrees
}

function calcSunDeclination(t) {
  var e = calcObliquityCorrection(t);
  var lambda = calcSunApparentLong(t);

  var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
  var theta = radToDeg(Math.asin(sint));
  return theta; // In degrees
}

function calcEquationOfTime(t) {
  var epsilon = calcObliquityCorrection(t);
  var l0 = calcGeomMeanLongSun(t);
  var e = calcEccentricityEarthOrbit(t);
  var m = calcGeomMeanAnomalySun(t);

  var y = Math.tan(degToRad(epsilon) / 2.0);
  y *= y;

  var sin2l0 = Math.sin(2.0 * degToRad(l0));
  var sinm = Math.sin(degToRad(m));
  var cos2l0 = Math.cos(2.0 * degToRad(l0));
  var sin4l0 = Math.sin(4.0 * degToRad(l0));
  var sin2m = Math.sin(2.0 * degToRad(m));

  var Etime = (y * sin2l0) - (2.0 * e * sinm) + (4.0 * e * y * sinm * cos2l0) - (0.5 * y * y * sin4l0) - (1.25 * e * e * sin2m);
  return radToDeg(Etime) * 4.0; // In minutes of time
}

function calcHourAngleSunrise(lat, solarDec) {
  var latRad = degToRad(lat);
  var sdRad = degToRad(solarDec);
  var HAarg = ((Math.cos(degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad))) - (Math.tan(latRad) * Math.tan(sdRad)));
  var HA = Math.acos(HAarg);
  return HA; // In radians (for sunset, use -HA)
}

function isNumber(inputVal) {
  var oneDecimal = false;
  var inputStr = String(inputVal);
  for (var i = 0; i < inputStr.length; i++) {
    var oneChar = inputStr.charAt(i);
    if (i === 0 && (oneChar === '-' || oneChar === '+')) {
      continue;
    }
    if (oneChar === '.' && !oneDecimal) {
      oneDecimal = true;
      continue;
    }
    if (oneChar < '0' || oneChar > '9') {
      return false;
    }
  }
  return true;
}

function getJD(timemnt) {
  var startmmnt = timemnt.clone().startOf('day');
    // Truncate any partial days and add half a day to normailize the time
  return Math.floor((startmmnt.valueOf() / 86400000) + 2440587.5) + 0.5;
}

/**
Commenting out unused functions to pass jlint
*
function getTimeLocal(timemnt) {
  var mmtMidnight = timemnt.clone().startOf('day');
  var timeInMinutes = timemnt.diff(mmtMidnight, 'minutes', true);
  if (timemnt.isDST()) {
    timeInMinutes -= 60;
  }
  return timeInMinutes;
}

*/

/* eslint max-params: ["error", 6] */
function calcAzEl(output, T, localtime, latitude, longitude, mmnt) {
  var azimuth;
  var refractionCorrection;
  var eqTime = calcEquationOfTime(T);
  var theta = calcSunDeclination(T);
  var solarTimeFix = eqTime + (4.0 * longitude) - (60.0 * getTimeZoneOffset(mmnt));
  calcSunRadVector(T);
  var trueSolarTime = localtime + solarTimeFix;
  while (trueSolarTime > 1440) {
    trueSolarTime -= 1440;
  }
  var hourAngle = (trueSolarTime / 4.0) - 180.0;
  if (hourAngle < -180) {
    hourAngle += 360.0;
  }
  var haRad = degToRad(hourAngle);
  var csz = (Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta))) + (Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad));
  if (csz > 1.0) {
    csz = 1.0;
  } else if (csz < -1.0) {
    csz = -1.0;
  }
  var zenith = radToDeg(Math.acos(csz));
  var azDenom = (Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)));
  if (Math.abs(azDenom) > 0.001) {
    var azRad = ((Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith))) - Math.sin(degToRad(theta))) / azDenom;
    if (Math.abs(azRad) > 1.0) {
      if (azRad < 0) {
        azRad = -1.0;
      } else {
        azRad = 1.0;
      }
    }
    azimuth = 180.0 - radToDeg(Math.acos(azRad));
    if (hourAngle > 0.0) {
      azimuth = -azimuth;
    }
  } else if (latitude > 0.0) {
    azimuth = 180.0;
  } else {
    azimuth = 0.0;
  }
  if (azimuth < 0.0) {
    azimuth += 360.0;
  }
  var exoatmElevation = 90.0 - zenith;

    // Atmospheric Refraction correction

  if (exoatmElevation > 85.0) {
    refractionCorrection = 0.0;
  } else {
    var te = Math.tan(degToRad(exoatmElevation));
    if (exoatmElevation > 5.0) {
      refractionCorrection = (58.1 / te) - (0.07 / (te * te * te)) + (0.000086 / (te * te * te * te * te));
    } else if (exoatmElevation > -0.575) {
      refractionCorrection = 1735.0 + (exoatmElevation * (-518.2 + (exoatmElevation * (103.4 + (exoatmElevation * (-12.79 + (exoatmElevation * 0.711)))))));
    } else {
      refractionCorrection = -20.774 / te;
    }
    refractionCorrection /= 3600.0;
  }

  var solarZen = zenith - refractionCorrection;

  if ((output) && (solarZen > 108.0)) {
    console.log('azbox dark');
    console.log('elbox dark');
  } else if (output) {
    console.log('azbox' + (Math.floor((azimuth * 100) + 0.5) / 100.0));
    console.log('elbox' + (Math.floor(((90.0 - solarZen) * 100) + 0.5) / 100.0));
  }
  return azimuth;
}

function calcSolNoon(jd, longitude, mmnt) {
  var solNoon = mmnt.clone().startOf('day');
  var tnoon = calcTimeJulianCent(jd - (longitude / 360.0));
  var eqTime = calcEquationOfTime(tnoon);
  var solNoonOffset = 720.0 - (longitude * 4) - eqTime; // In minutes
  var newt = calcTimeJulianCent(jd + (solNoonOffset / 1440.0));
  eqTime = calcEquationOfTime(newt);
  var solNoonLocal = 720 - (longitude * 4) - eqTime + (getTimeZoneOffset(mmnt) * 60.0); // In minutes
  while (solNoonLocal < 0.0) {
    solNoonLocal += 1440.0;
  }
  while (solNoonLocal >= 1440.0) {
    solNoonLocal -= 1440.0;
  }
  solNoon.add(solNoonLocal, 'minutes');
  return solNoon;
}

function calcSunriseSetUTC(rise, JD, latitude, longitude) {
  var t = calcTimeJulianCent(JD);
  var eqTime = calcEquationOfTime(t);
  var solarDec = calcSunDeclination(t);
  var hourAngle = calcHourAngleSunrise(latitude, solarDec);
    // Alert("HA = " + radToDeg(hourAngle));
  if (!rise) {
    hourAngle = -hourAngle;
  }
  var delta = longitude + radToDeg(hourAngle);
  var timeUTC = 720 - (4.0 * delta) - eqTime; // In minutes
  return timeUTC;
}

function calcSunriseSet(rise, JD, latitude, longitude, mmnt) {
// Rise = 1 for sunrise, 0 for sunset

  var timezone = getTimeZoneOffset(mmnt);
  var sunTime = mmnt.clone().startOf('day');
  var timeUTC = calcSunriseSetUTC(rise, JD, latitude, longitude);
  var newTimeUTC = calcSunriseSetUTC(rise, JD + (timeUTC / 1440.0), latitude, longitude);
  if (isNumber(newTimeUTC)) {
    var timeLocal = newTimeUTC + (timezone * 60.0);
        // If (document.getElementById(rise ? "showsr" : "showss").checked) {
        //  var riseT = calcTimeJulianCent(JD + newTimeUTC/1440.0)
        //  var riseAz = calcAzEl(0, riseT, timeLocal, latitude, longitude, timezone)

        // }
    sunTime.add(timeLocal, 'minutes');
  } else { // No sunrise/set found
    var doy = calcDoyFromJD(JD);
    var jdy;
    if (((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
            ((latitude < -66.4) && ((doy < 83) || (doy > 263)))) { // Previous sunrise/next sunset
      if (rise) { // Find previous sunrise
        jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone);
      } else { // Find next sunset
        jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone);
      }
      sunTime = moment(new Julian().julian(jdy).getDate());
    } else { // Previous sunset/next sunrise
      if (rise === 1) { // Find previous sunrise
        jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone);
      } else { // Find next sunset
        jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone);
      }
      sunTime = moment(new Julian().julian(jdy).getDate());
    }
  }
  return sunTime;
}

function calcJDofNextPrevRiseSet(next, rise, JD, latitude, longitude, tz) {
  var julianday = JD;
  var increment = ((next) ? 1.0 : -1.0);

  var time = calcSunriseSetUTC(rise, julianday, latitude, longitude);
  while (!isNumber(time)) {
    julianday += increment;
    time = calcSunriseSetUTC(rise, julianday, latitude, longitude);
  }
  var timeLocal = time + (tz * 60.0);
  while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
    var incr = ((timeLocal < 0) ? 1 : -1);
    timeLocal += (incr * 1440.0);
    julianday -= incr;
  }
  return julianday;
}

function getTimeZoneOffset(mmnt) {
  return mmnt.utcOffset() / 60;
}

function getTimes(lat, lng, mmnt) {
  var times = {};
  var jday = getJD(mmnt);
    // Var tl = getTimeLocal(mmnt);
    // Var total = jday + tl / 1440.0 - getTimeZoneOffset(mmnt) / 24.0;
    // Var T = calcTimeJulianCent(total);
    //  calcAzEl(1, T, tl, lat, lng, mmnt);
  times.solarNoon = calcSolNoon(jday, lng, mmnt);
  times.sunrise = calcSunriseSet(1, jday, lat, lng, mmnt);
  times.sunset = calcSunriseSet(0, jday, lat, lng, mmnt);

  return times;
}

module.exports = {getTimes, calcAzEl};
