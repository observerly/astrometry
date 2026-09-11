/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nutation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getAngularSeparation,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getNutation
} from '../src'

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

// The true place of the date of a J2000 coordinate, e.g., the coordinate carried to its mean place of the date
// by the correction for the precession of the equinoxes, and from that mean place to the true equator and equinox
// of the date by the correction for the nutation, given the mean place:
const getTruePlaceOfDate = (datetime: Date, target: EquatorialCoordinate): EquatorialCoordinate => {
  const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, target)

  const mean = { ra: target.ra + precession.ra, dec: target.dec + precession.dec }

  const nutation = getCorrectionToEquatorialForNutation(datetime, mean)

  return { ra: mean.ra + nutation.ra, dec: mean.dec + nutation.dec }
}

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForNutation', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForNutation).toBeDefined()
  })

  it('should carry the mean place to the true place of the date for the J2000 default epoch', () => {
    const { ra, dec } = getTruePlaceOfDate(new Date('2000-01-01T00:00:00+00:00'), betelgeuse)
    expect(ra).toBeCloseTo(88.7891936741075, 9)
    expect(dec).toBeCloseTo(7.405431731535656, 9)
  })

  it('should carry the mean place to the true place of the date for the designated epoch', () => {
    const { ra, dec } = getTruePlaceOfDate(datetime, betelgeuse)
    expect(ra).toBeCloseTo(89.07743863297038, 9)
    expect(dec).toBeCloseTo(7.409983972426182, 9)
  })

  it.each([{ ra: 10, dec: 89.9999 }, { ra: 200, dec: -89.9999 }])(
    'should rotate a target at the celestial pole by the nutation without diverging for $ra, $dec',
    target => {
      const { ra, dec } = getCorrectionToEquatorialForNutation(datetime, target)

      const { Δψ, Δε } = getNutation(datetime)

      expect(Number.isFinite(ra)).toBe(true)
      expect(Number.isFinite(dec)).toBe(true)

      // The rotation displaces a target by no more than the nutation itself, whatever the declination,
      // e.g., the first order correction, which divides by cos δ, would diverge here:
      const separation = getAngularSeparation(
        { θ: target.dec + dec, φ: target.ra + ra },
        { θ: target.dec, φ: target.ra }
      )

      expect(separation).toBeLessThan(Math.abs(Δψ) + Math.abs(Δε))
    }
  )
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
