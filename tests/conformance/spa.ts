/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/spa
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

// The reference values in this module are generated with the NREL Solar Position Algorithm
// (SPA), e.g., the algorithm of Reda, I., & Andreas, A. (2004), "Solar position algorithm for
// solar radiation applications", Solar Energy, 76(5), 577-589, as implemented by pvlib
// (pvlib.spa, version 0.15.2), which is a faithful port of the reference implementation.
//
// The SPA is stated to be accurate to ±0.0003° in the position of the Sun. The transit of
// each reference is resolved by a bisection of the hour angle of the full SPA position of the
// Sun through zero, and the rise and set by a bisection of its geocentric altitude through
// the standard almanac altitude of -0.8333°, e.g., the geometric altitude at which the upper
// limb of the Sun touches the horizon under a fixed ~34 arcminute refraction.
//
// N.B. The events are deliberately not those of the interpolation and refinement procedure of
// Appendix A.2 of the SPA, which extrapolates its three point fit for an event that falls
// across the 0h UT day boundary, and so departs from the position it interpolates by tens of
// seconds for such an event, e.g., a rise on the previous civil day.
//
// N.B. The SPA is evaluated in Terrestrial Time, and so each reference carries the ΔT it is
// generated with, e.g., the difference TT - UT (in seconds) at its epoch (IERS).
//
// N.B. All of the observers are at an elevation of zero, e.g., at sea level, as the SPA does
// not depress the rise and set for the elevation of the observer.

/*****************************************************************************************************************/

export interface SPAGeocentricSolarCoordinate {
  // The instant the geocentric apparent place of the Sun is referred to (in UTC):
  datetime: string
  // The difference TT - UT at the instant (in seconds):
  ΔT: number
  // The geocentric apparent right ascension of the Sun (in degrees):
  ra: number
  // The geocentric apparent declination of the Sun (in degrees):
  dec: number
}

/*****************************************************************************************************************/

export interface SPASolarTransitInstance {
  // The name of the site the events are resolved for:
  name: string
  // The latitude of the observer (in degrees):
  latitude: number
  // The longitude of the observer (in degrees):
  longitude: number
  // The elevation of the observer above sea level (in metres):
  elevation: number
  // The date the events are resolved for (in UTC):
  date: string
  // The difference TT - UT at the date (in seconds):
  ΔT: number
  // The transit of the Sun across the local meridian, e.g., local solar noon (in UTC):
  transit: string
  // The rise of the Sun at the standard almanac altitude of -0.8333°, or null where the Sun
  // does not cross the horizon for the date, e.g., for an observer in a polar day or night:
  sunrise: string | null
  // The set of the Sun at the standard almanac altitude of -0.8333°, or null likewise:
  sunset: string | null
}

/*****************************************************************************************************************/

// The geocentric apparent place of the Sun, e.g., referred to the true equator and equinox of
// date, and corrected for the aberration of light:
export const geocentricSolarCoordinates: SPAGeocentricSolarCoordinate[] = [
  {
    datetime: '2000-01-21T00:00:00.000Z',
    ΔT: 63.9,
    ra: 302.4286747155474,
    dec: -20.0984991606909
  },
  {
    datetime: '2000-01-21T12:00:00.000Z',
    ΔT: 63.9,
    ra: 302.9574926289234,
    dec: -19.98920649345106
  },
  {
    datetime: '2013-09-22T00:00:00.000Z',
    ΔT: 66.9,
    ra: 179.22470123942819,
    dec: 0.335992887942134
  },
  {
    datetime: '2013-09-22T12:00:00.000Z',
    ΔT: 66.9,
    ra: 179.67332439740576,
    dec: 0.14151727243348983
  },
  {
    datetime: '2026-03-20T00:00:00.000Z',
    ΔT: 69.1,
    ra: 359.4387985727212,
    dec: -0.24316151437665504
  },
  {
    datetime: '2026-03-20T12:00:00.000Z',
    ΔT: 69.1,
    ra: 359.89488195011955,
    dec: -0.04542355882679091
  },
  {
    datetime: '2026-06-21T00:00:00.000Z',
    ΔT: 69.2,
    ra: 89.63558249377226,
    dec: 23.437551572451312
  },
  {
    datetime: '2026-06-21T12:00:00.000Z',
    ΔT: 69.2,
    ra: 90.15571717832441,
    dec: 23.43787975581587
  },
  {
    datetime: '2026-12-21T00:00:00.000Z',
    ΔT: 69.3,
    ra: 269.0367357339904,
    dec: -23.434510934866527
  },
  {
    datetime: '2026-12-21T12:00:00.000Z',
    ΔT: 69.3,
    ra: 269.59146189984756,
    dec: -23.436925802434075
  }
]

/*****************************************************************************************************************/

// The rise, transit and set of the Sun, across a spread of latitudes, seasons and epochs:
export const solarTransitInstances: SPASolarTransitInstance[] = [
  {
    name: 'Greenwich',
    latitude: 51.4769,
    longitude: -0.0005,
    elevation: 0,
    date: '2026-12-21',
    ΔT: 69.3,
    transit: '2026-12-21T11:58:03.955Z',
    sunrise: '2026-12-21T08:03:03.935Z',
    sunset: '2026-12-21T15:53:03.584Z'
  },
  {
    name: 'Greenwich',
    latitude: 51.4769,
    longitude: -0.0005,
    elevation: 0,
    date: '2026-06-21',
    ΔT: 69.2,
    transit: '2026-06-21T12:01:49.180Z',
    sunrise: '2026-06-21T03:42:44.375Z',
    sunset: '2026-06-21T20:20:53.651Z'
  },
  {
    name: 'Greenwich',
    latitude: 51.4769,
    longitude: -0.0005,
    elevation: 0,
    date: '2026-03-20',
    ΔT: 69.1,
    transit: '2026-03-20T12:07:26.217Z',
    sunrise: '2026-03-20T06:02:52.833Z',
    sunset: '2026-03-20T18:13:00.037Z'
  },
  {
    name: 'Stonehenge',
    latitude: 51.1789,
    longitude: -1.8262,
    elevation: 0,
    date: '2000-01-21',
    ΔT: 63.9,
    transit: '2000-01-21T12:18:27.443Z',
    sunrise: '2000-01-21T07:59:50.532Z',
    sunset: '2000-01-21T16:37:33.723Z'
  },
  {
    name: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    elevation: 0,
    date: '2026-12-21',
    ΔT: 69.3,
    transit: '2026-12-21T01:53:01.120Z',
    sunrise: '2026-12-20T18:40:38.096Z',
    sunset: '2026-12-21T09:05:24.903Z'
  },
  {
    name: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    elevation: 0,
    date: '2013-09-22',
    ΔT: 66.9,
    transit: '2013-09-22T04:57:27.791Z',
    sunrise: '2013-09-21T22:54:11.091Z',
    sunset: '2013-09-22T11:00:43.383Z'
  },
  {
    name: 'Quito',
    latitude: -0.1807,
    longitude: -78.4678,
    elevation: 0,
    date: '2026-03-20',
    ΔT: 69.1,
    transit: '2026-03-20T17:21:14.517Z',
    sunrise: '2026-03-20T11:17:58.939Z',
    sunset: '2026-03-20T23:24:29.937Z'
  },
  {
    name: 'Tromsø',
    latitude: 69.6492,
    longitude: 18.9553,
    elevation: 0,
    date: '2026-12-21',
    ΔT: 69.3,
    transit: '2026-12-21T10:42:12.997Z',
    sunrise: null,
    sunset: null
  },
  {
    name: 'Tromsø',
    latitude: 69.6492,
    longitude: 18.9553,
    elevation: 0,
    date: '2026-06-21',
    ΔT: 69.2,
    transit: '2026-06-21T10:45:59.098Z',
    sunrise: null,
    sunset: null
  }
]

/*****************************************************************************************************************/
