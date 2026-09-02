/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  getEclipticPlane,
  getNutation,
  getObliquityOfTheEcliptic,
  getSolarEquatorialCoordinate,
  getTrueObliquityOfTheEcliptic
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getEclipticPlane', () => {
  it('should be defined', () => {
    expect(getEclipticPlane).toBeDefined()
  })

  it('should return the correct amount of coordinate points of the ecliptic plane for the given datetime', () => {
    const ecliptic = getEclipticPlane(datetime)
    expect(ecliptic.length).toBe(366)
  })

  it('should return a coordinate point for every day of a leap year, and for the following 1st January', () => {
    const ecliptic = getEclipticPlane(new Date('2024-05-14T00:00:00.000+00:00'))
    expect(ecliptic.length).toBe(367)
  })

  it('should start at the 1st January of the year of the datetime given', () => {
    const [first] = getEclipticPlane(datetime)

    const { ra, dec } = getSolarEquatorialCoordinate(new Date('2021-01-01T00:00:00.000+00:00'))

    expect(first.ra).toBe(ra)
    expect(first.dec).toBe(dec)
  })

  it('should not modify the datetime given', () => {
    getEclipticPlane(datetime)

    expect(datetime).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })

  it('should return the same ecliptic plane irrespective of the host timezone', () => {
    const TZ = process.env.TZ

    // The year boundary is derived in UTC, and the plane is therefore independent of the timezone of
    // the host system the library is running on:
    const expected = getEclipticPlane(datetime)

    try {
      for (const timezone of ['Pacific/Auckland', 'America/New_York', 'Asia/Kolkata']) {
        process.env.TZ = timezone

        const ecliptic = getEclipticPlane(datetime)

        expect(ecliptic.length).toBe(expected.length)

        for (let i = 0; i < ecliptic.length; i++) {
          expect(ecliptic[i].ra).toBe(expected[i].ra)
          expect(ecliptic[i].dec).toBe(expected[i].dec)
        }
      }
    } finally {
      process.env.TZ = TZ
    }
  })
})

/*****************************************************************************************************************/

describe('getObliquityOfTheEcliptic', () => {
  it('should be defined', () => {
    expect(getObliquityOfTheEcliptic).toBeDefined()
  })

  it('should return the Obliquity of the Ecliptic (e) of the given date', () => {
    const ε = getObliquityOfTheEcliptic(datetime)
    expect(ε).toBe(23.436511890585354)
  })
})

/*****************************************************************************************************************/

describe('getTrueObliquityOfTheEcliptic', () => {
  it('should be defined', () => {
    expect(getTrueObliquityOfTheEcliptic).toBeDefined()
  })

  it('should return the True Obliquity of the Ecliptic (e) of the given date', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)
    expect(ε).toBe(23.43726508766999)
  })

  it('should be the mean obliquity of the ecliptic corrected for the nutation in obliquity', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { Δε } = getNutation(datetime)

    expect(ε).toBeCloseTo(getObliquityOfTheEcliptic(datetime) + Δε, 9)
  })

  it('should agree with the worked example of Meeus for the true obliquity of the ecliptic', () => {
    // Meeus, J. (1998). "Astronomical Algorithms", 2nd ed., example 22.a: the true obliquity of
    // the ecliptic on 1987-04-10T00:00:00 TD is 23°26'36.850", e.g., ~23.443569°, which the lower
    // accuracy series here resolves to within ~an arcsecond:
    const ε = getTrueObliquityOfTheEcliptic(new Date('1987-04-10T00:00:00.000+00:00'))

    expect(Math.abs(ε - 23.443569)).toBeLessThan(0.0003)
  })
})

/*****************************************************************************************************************/
