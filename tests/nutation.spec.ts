/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nutation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, getCorrectionToEquatorialForNutation, getNutation } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForNutation', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForNutation).toBeDefined()
  })

  it('should return the correct nutation correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForNutation(
      new Date('2000-01-01T00:00:00+00:00'),
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBe(88.78918548764206)
    expect(dec + betelgeuse.dec).toBe(7.405435271760147)
  })

  it('should return the correct nutation correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForNutation(datetime, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78822492448745)
    expect(dec + betelgeuse.dec).toBe(7.407776028046682)
  })
})

/*****************************************************************************************************************/

describe('getNutation', () => {
  it('should be defined', () => {
    expect(getNutation).toBeDefined()
  })

  it('should return the nutation in longitude and obliquity for the Meeus example epoch', () => {
    // Meeus, Astronomical Algorithms, Example 22.a (1987 April 10.0 TD):
    const { Δψ, Δε } = getNutation(new Date('1987-04-10T00:00:00.000+00:00'))
    // The nutation in longitude should be approximately -3.788 arcseconds:
    expect(Δψ * 3600).toBeCloseTo(-3.788, 0)
    // The nutation in obliquity should be approximately +9.443 arcseconds:
    expect(Δε * 3600).toBeCloseTo(9.443, 0)
  })

  it('should return the nutation in degrees', () => {
    const { Δψ, Δε } = getNutation(datetime)
    // The nutation in longitude is always less than ~20 arcseconds in magnitude:
    expect(Math.abs(Δψ)).toBeLessThan(20 / 3600)
    // The nutation in obliquity is always less than ~10 arcseconds in magnitude:
    expect(Math.abs(Δε)).toBeLessThan(10 / 3600)
  })
})

/*****************************************************************************************************************/
