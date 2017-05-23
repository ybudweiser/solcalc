# solcalc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> 
## Discription
solcalc is a JavaScript library for calculating exact sunrise and sunset times for a given location, based on the implementation of the [NOAA Solar Calculator](https://www.esrl.noaa.gov/gmd/grad/solcalc). 

## Disclaimer
Times are mathematically acurate for the given day and final times are not rounded. [NOAA Solar Calculator](https://www.esrl.noaa.gov/gmd/grad/solcalc) rounds time to the nearest minute and may differ slightly from the results here.

## Installation

```sh
$ npm install --save solcalc
```

## Usage

```js
const solcalc = require('solcalc');

solcalc.getTimes(/*Moment*/ date, /*Number*/ latitude, /*Number*/ longitude)
```
Returns an object with the following properties (each is a `Moment` object):

| Property        | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `sunrise`       | sunrise                      |
| `sunset`    | sunrise ends                |
| `solarNoon` |          |

## Usage(Binary)
````bash
./solcalc
  Usage: index [options]
  A Javascript module used to calculate sunrise, and sunset based on the NOAA Calculations
  Options:
    -h, --help               output usage information
    -V, --version            output the version number
    -l, --latitude  <n>*     latitude
    -g, --longitude  <n>*    longitude
    -d, --date [YYYY-MM-DD]  date in YYYY-MM-DD format, defaults to current date
````
## License

LGPL-3.0 © [yitz]()


[npm-image]: https://badge.fury.io/js/solcalc.svg
[npm-url]: https://npmjs.org/package/solcalc
[travis-image]: https://travis-ci.org/ybudweiser@gmail.com/solcalc.svg?branch=master
[travis-url]: https://travis-ci.org/ybudweiser@gmail.com/solcalc
[daviddm-image]: https://david-dm.org/ybudweiser@gmail.com/solcalc.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ybudweiser@gmail.com/solcalc
[coveralls-image]: https://coveralls.io/repos/ybudweiser@gmail.com/solcalc/badge.svg
[coveralls-url]: https://coveralls.io/r/ybudweiser@gmail.com/solcalc
