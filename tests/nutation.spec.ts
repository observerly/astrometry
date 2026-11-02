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
  getNutation,
  getObliquityOfTheEcliptic,
  getTrueObliquityOfTheEcliptic
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

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

  // The corrections of the rotation of the nutation matrix of the library, pinned to 12 decimal
  // places, with the displacement in right ascension taken within [−180°, 180°) (in degrees):
  it.each([
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      Δra: -0.0015144979749948106,
      Δdec: 0.0018531576245948145
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      Δra: -0.12989567949409775,
      Δdec: 0.0005447633827060372
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'a target just west of the origin of right ascension',
      ra: 359.99,
      dec: -10,
      Δra: -0.0030798181233535615,
      Δdec: -0.0011767470180359396
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      Δra: 0.0025869415488841696,
      Δdec: 0.0015658228129566965
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      Δra: 0.009736025596112086,
      Δdec: 0.0020722286696184256
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'a target just west of the origin of right ascension',
      ra: 359.99,
      dec: -10,
      Δra: 0.003447337275474638,
      Δdec: 0.0015956607609801665
    }
  ])('should return the pinned correction for $name at $datetime', reference => {
    const { ra, dec } = getCorrectionToEquatorialForNutation(
      new Date(reference.datetime),
      reference
    )

    expect(ra).toBeCloseTo(reference.Δra, 12)
    expect(dec).toBeCloseTo(reference.Δdec, 12)
  })

  it.each([
    {
      datetime: '1980-04-22T06:00:00.000Z',
      pole: 'north',
      ra: 123.4,
      dec: 90,
      Δra: -63.040831408715064,
      Δdec: -0.00238031676875039
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      pole: 'south',
      ra: 123.4,
      dec: -90,
      Δra: 116.95916859113441,
      Δdec: 0.00238031676875039
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      pole: 'north',
      ra: 123.4,
      dec: 90,
      Δra: 16.851573574783856,
      Δdec: -0.0020751671135457173
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      pole: 'south',
      ra: 123.4,
      dec: -90,
      Δra: -163.14842642516004,
      Δdec: 0.0020751671135457173
    }
  ])(
    'should carry the $pole celestial pole onto the true pole of the date at $datetime',
    reference => {
      // N.B. The right ascension of a pole is degenerate, and so the displacement in right
      // ascension is that of the right ascension given, 123.4°, to that of the mean pole of the
      // date in the true frame of the date:
      const { ra, dec } = getCorrectionToEquatorialForNutation(
        new Date(reference.datetime),
        reference
      )

      expect(ra).toBeCloseTo(reference.Δra, 8)
      expect(dec).toBeCloseTo(reference.Δdec, 12)
    }
  )

  it.each([
    { ra: 10, dec: 89.9999 },
    { ra: 200, dec: -89.9999 }
  ])(
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
