/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nutation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertCartesianToEquatorial,
  convertEquatorialToCartesian,
  doDeterminant,
  doTranspose,
  type EquatorialCoordinate,
  getAngularSeparation,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getMatrixProduct,
  getNutation,
  getNutationMatrix,
  getObliquityOfTheEcliptic,
  getRotatedCartesianCoordinate,
  getRotationMatrix,
  getTrueObliquityOfTheEcliptic,
  IDENTITY_MATRIX,
  type Matrix3,
  convertDegreesToRadians as radians
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

describe('getNutationMatrix', () => {
  // The dates across which the nutation matrix is resolved, about J2000.0:
  const dates = [
    '1980-04-22T06:00:00.000Z',
    '2000-01-01T12:00:00.000Z',
    '2013-09-22T04:00:00.000Z',
    '2021-05-14T00:00:00.000Z',
    '2026-09-06T00:00:00.000Z',
    '2050-03-20T12:00:00.000Z'
  ]

  it('should be defined', () => {
    expect(getNutationMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const N = getNutationMatrix(datetime)
    expectTypeOf(N).toEqualTypeOf<Matrix3>()
    expect(N).toHaveLength(3)
    for (const row of N) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it.each(dates)('should have a determinant of 1 at %s, e.g., as it is a proper rotation', when => {
    expect(doDeterminant(getNutationMatrix(new Date(when)))).toBeCloseTo(1, 15)
  })

  it.each(dates)('should be orthogonal at %s, e.g., N · Nᵀ = Nᵀ · N = I', when => {
    const N = getNutationMatrix(new Date(when))

    const NNᵀ = getMatrixProduct(N, doTranspose(N))

    const NᵀN = getMatrixProduct(doTranspose(N), N)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(NNᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(NᵀN[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it.each(dates)('should be within ~1e-4 of the identity, but not equal to it, at %s', when => {
    const N = getNutationMatrix(new Date(when))

    // N.B. The nutation is of the order of 20″ at most, e.g., ~1e-4 radians:
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const offset = Math.abs(N[i][j] - IDENTITY_MATRIX[i][j])
        expect(offset).toBeGreaterThan(0)
        expect(offset).toBeLessThan(1e-4)
      }
    }
  })

  it('should equal R1(−(ε₀ + Δε)) · R3(−Δψ) · R1(ε₀) of the nutation of the date', () => {
    const ε0 = getObliquityOfTheEcliptic(datetime)

    const { Δψ, Δε } = getNutation(datetime)

    const R = getMatrixProduct(
      getRotationMatrix('x', -(ε0 + Δε)),
      getMatrixProduct(getRotationMatrix('z', -Δψ), getRotationMatrix('x', ε0))
    )

    expect(getNutationMatrix(datetime)).toEqual(R)
  })

  it.each(dates)(
    'should rotate the frame by the whole of the nutation, √(Δψ² + Δε²), at %s',
    when => {
      const N = getNutationMatrix(new Date(when))

      const { Δψ, Δε } = getNutation(new Date(when))

      // The angle of the whole rotation, from the trace of the matrix, e.g., 1 + 2 cos φ (in
      // arcseconds):
      const φ = (Math.acos((N[0][0] + N[1][1] + N[2][2] - 1) / 2) * 180 * 3600) / Math.PI

      // N.B. The rotation in longitude is about the pole of the ecliptic, and the rotation in
      // obliquity is about the equinox, which lies in the ecliptic, and so the two are at right
      // angles:
      expect(φ).toBeCloseTo(Math.hypot(Δψ, Δε) * 3600, 5)
    }
  )

  it.each(dates)(
    'should displace the mean pole towards the mean equinox by sin ε sin Δψ at %s',
    when => {
      const ε = getTrueObliquityOfTheEcliptic(new Date(when))

      const { Δψ } = getNutation(new Date(when))

      // The true pole of the date, carried back into the mean frame of the date, e.g., the third
      // row of the nutation matrix:
      const pole = getRotatedCartesianCoordinate(doTranspose(getNutationMatrix(new Date(when))), {
        x: 0,
        y: 0,
        z: 1
      })

      // N.B. The nutation in longitude, projected onto the equator by the sine of the true
      // obliquity:
      expect(pole.x).toBeCloseTo(Math.sin(radians(ε)) * Math.sin(radians(Δψ)), 15)
    }
  )

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639 },
    { name: 'Polaris', ra: 37.95456067, dec: 89.26410897 },
    { name: 'Canopus', ra: 95.98787778, dec: -52.69566111 },
    { name: 'Vega', ra: 279.23473479, dec: 38.78368896 },
    { name: 'σ Octantis', ra: 317.19541667, dec: -88.9565 }
  ])('should agree with getCorrectionToEquatorialForNutation for $name', ({ ra, dec }) => {
    const correction = getCorrectionToEquatorialForNutation(datetime, { ra, dec })

    const nutated = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getNutationMatrix(datetime),
        convertEquatorialToCartesian({ ra, dec })
      )
    )

    // N.B. The separation is taken, rather than the difference in right ascension, which is
    // stretched by 1 / cos δ towards the poles:
    const separation = getAngularSeparation(
      { θ: dec + correction.dec, φ: ra + correction.ra },
      { θ: nutated.dec, φ: nutated.ra }
    )

    expect(separation).toBeLessThan(1e-10)
  })

  it('should be undone by its transpose, e.g., Nᵀ (N v) = v, back to the mean place', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const N = getNutationMatrix(datetime)

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(N),
      getRotatedCartesianCoordinate(N, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should return the same matrix for the same date, and another for another date', () => {
    expect(getNutationMatrix(datetime)).toEqual(getNutationMatrix(new Date(datetime)))
    expect(getNutationMatrix(datetime)).not.toEqual(
      getNutationMatrix(new Date('2050-03-20T12:00:00.000Z'))
    )
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getNutationMatrix(datetime)).not.toBe(getNutationMatrix(datetime))
  })
})

/*****************************************************************************************************************/
