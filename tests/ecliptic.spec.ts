/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  getNutation,
  getObliquityOfTheEcliptic,
  getTrueObliquityOfTheEcliptic
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getObliquityOfTheEcliptic', () => {
  it('should be defined', () => {
    expect(getObliquityOfTheEcliptic).toBeDefined()
  })

  it('should return the Obliquity of the Ecliptic (e) of the given date', () => {
    const ε = getObliquityOfTheEcliptic(datetime)
    expect(ε).toBeCloseTo(23.436499838724593, 9)
  })
})

/*****************************************************************************************************************/

describe('getTrueObliquityOfTheEcliptic', () => {
  it('should be defined', () => {
    expect(getTrueObliquityOfTheEcliptic).toBeDefined()
  })

  it('should return the True Obliquity of the Ecliptic (e) of the given date', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)
    expect(ε).toBeCloseTo(23.43724726108981, 9)
  })

  it('should be the mean obliquity of the ecliptic corrected for the nutation in obliquity', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { Δε } = getNutation(datetime)

    expect(ε).toBeCloseTo(getObliquityOfTheEcliptic(datetime) + Δε, 9)
  })

  it('should agree with the worked example of Meeus for the true obliquity of the ecliptic', () => {
    // Meeus, J. (1998). "Astronomical Algorithms", 2nd ed., example 22.a: the true obliquity of
    // the ecliptic on 1987-04-10T00:00:00 TD is 23°26'36.850", e.g., ~23.443569°, stated for the
    // mean obliquity of IAU 1980, which sits ~0.04 arcseconds above that of IAU 2006 resolved here:
    const ε = getTrueObliquityOfTheEcliptic(new Date('1987-04-10T00:00:00.000+00:00'))

    expect(Math.abs(ε - 23.443569)).toBeLessThan(0.00002)
  })
})

/*****************************************************************************************************************/
