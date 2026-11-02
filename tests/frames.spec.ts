/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/frames
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertCartesianToEquatorial,
  convertEclipticToEquatorial,
  convertEquatorialToCartesian,
  doDeterminant,
  doTranspose,
  getAngularSeparation,
  getBiasPrecessionNutationMatrix,
  getCorrectionToEquatorialForFrameBias,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getEquatorialToEclipticMatrix,
  getFrameBiasMatrix,
  getMatrixProduct,
  getNutationMatrix,
  getPrecessionMatrix,
  getRotatedCartesianCoordinate,
  getRotationMatrix,
  getTrueObliquityOfTheEcliptic,
  IDENTITY_MATRIX,
  type Matrix3
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getBiasPrecessionNutationMatrix', () => {
  // The instant of J2000.0, e.g., 2000-01-01T12:00:00.000 TT, in UTC (TT − UTC = 64.184 seconds):
  const J2000 = new Date('2000-01-01T11:58:55.816Z')

  // The dates across which the bias-precession-nutation matrix is resolved, about J2000.0:
  const dates = [
    '1980-04-22T06:00:00.000Z',
    '2000-01-01T12:00:00.000Z',
    '2013-09-22T04:00:00.000Z',
    '2021-05-14T00:00:00.000Z',
    '2026-09-06T00:00:00.000Z',
    '2050-03-20T12:00:00.000Z'
  ]

  it('should be defined', () => {
    expect(getBiasPrecessionNutationMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const NPB = getBiasPrecessionNutationMatrix(datetime)
    expectTypeOf(NPB).toEqualTypeOf<Matrix3>()
    expect(NPB).toHaveLength(3)
    for (const row of NPB) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it.each(dates)('should have a determinant of 1 at %s, e.g., as it is a proper rotation', when => {
    expect(doDeterminant(getBiasPrecessionNutationMatrix(new Date(when)))).toBeCloseTo(1, 15)
  })

  it.each(dates)('should be orthogonal at %s, e.g., NPB · NPBᵀ = NPBᵀ · NPB = I', when => {
    const NPB = getBiasPrecessionNutationMatrix(new Date(when))

    const NPBNPBᵀ = getMatrixProduct(NPB, doTranspose(NPB))

    const NPBᵀNPB = getMatrixProduct(doTranspose(NPB), NPB)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(NPBNPBᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(NPBᵀNPB[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it.each(dates)(
    'should equal N · P · B of the nutation, precession and frame bias at %s',
    when => {
      const N = getNutationMatrix(new Date(when))

      const P = getPrecessionMatrix(new Date(when))

      const B = getFrameBiasMatrix()

      expect(getBiasPrecessionNutationMatrix(new Date(when))).toEqual(
        getMatrixProduct(N, getMatrixProduct(P, B))
      )
    }
  )

  it('should equal N · B at J2000.0, e.g., as the precession matrix is the identity', () => {
    const NPB = getBiasPrecessionNutationMatrix(J2000)

    const NB = getMatrixProduct(getNutationMatrix(J2000), getFrameBiasMatrix())

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(NPB[i][j] - NB[i][j])).toBeLessThan(1e-12)
      }
    }
  })

  it('should not commute, e.g., B · P · N differs from N · P · B away from J2000.0', () => {
    const N = getNutationMatrix(datetime)

    const P = getPrecessionMatrix(datetime)

    const B = getFrameBiasMatrix()

    const BPN = getMatrixProduct(B, getMatrixProduct(P, N))

    const NPB = getBiasPrecessionNutationMatrix(datetime)

    // N.B. The order of the rotations matters at the order of the product of the angles, e.g.,
    // ~1e-4 × ~5e-3 radians, ~0.1″, which is far above the precision of the matrix:
    let difference = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        difference = Math.max(difference, Math.abs(NPB[i][j] - BPN[i][j]))
      }
    }

    expect(difference).toBeGreaterThan(1e-9)
  })

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639 },
    { name: 'Polaris', ra: 37.95456067, dec: 89.26410897 },
    { name: 'Canopus', ra: 95.98787778, dec: -52.69566111 },
    { name: 'Vega', ra: 279.23473479, dec: 38.78368896 },
    { name: 'σ Octantis', ra: 317.19541667, dec: -88.9565 }
  ])(
    'should agree with the corrections for bias, precession and nutation for $name',
    ({ ra, dec }) => {
      // The catalogue coordinate, carried to the mean equator and equinox of J2000.0 by the frame
      // bias, to the mean equator and equinox of the date by the precession, and to the true
      // equator and equinox of the date by the nutation, in turn:
      const bias = getCorrectionToEquatorialForFrameBias({ ra, dec })

      const biased = { ra: ra + bias.ra, dec: dec + bias.dec }

      const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, biased)

      const mean = { ra: biased.ra + precession.ra, dec: biased.dec + precession.dec }

      const nutation = getCorrectionToEquatorialForNutation(datetime, mean)

      const corrected = { ra: mean.ra + nutation.ra, dec: mean.dec + nutation.dec }

      const rotated = convertCartesianToEquatorial(
        getRotatedCartesianCoordinate(
          getBiasPrecessionNutationMatrix(datetime),
          convertEquatorialToCartesian({ ra, dec })
        )
      )

      // N.B. The separation is taken, rather than the difference in right ascension, which is
      // stretched by 1 / cos δ towards the poles:
      const separation = getAngularSeparation(
        { θ: corrected.dec, φ: corrected.ra },
        { θ: rotated.dec, φ: rotated.ra }
      )

      expect(separation).toBeLessThan(1e-9)
    }
  )

  it('should be undone by its transpose, e.g., NPBᵀ (NPB v) = v, back to the ICRS', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const NPB = getBiasPrecessionNutationMatrix(datetime)

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(NPB),
      getRotatedCartesianCoordinate(NPB, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should return the same matrix for the same date, and another for another date', () => {
    expect(getBiasPrecessionNutationMatrix(datetime)).toEqual(
      getBiasPrecessionNutationMatrix(new Date(datetime))
    )
    expect(getBiasPrecessionNutationMatrix(datetime)).not.toEqual(
      getBiasPrecessionNutationMatrix(J2000)
    )
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getBiasPrecessionNutationMatrix(datetime)).not.toBe(
      getBiasPrecessionNutationMatrix(datetime)
    )
  })
})

/*****************************************************************************************************************/

describe('getEquatorialToEclipticMatrix', () => {
  // The dates across which the equatorial to ecliptic matrix is resolved, about J2000.0:
  const dates = [
    '1980-04-22T06:00:00.000Z',
    '2000-01-01T12:00:00.000Z',
    '2013-09-22T04:00:00.000Z',
    '2021-05-14T00:00:00.000Z',
    '2026-09-06T00:00:00.000Z',
    '2050-03-20T12:00:00.000Z'
  ]

  it('should be defined', () => {
    expect(getEquatorialToEclipticMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const E = getEquatorialToEclipticMatrix(datetime)
    expectTypeOf(E).toEqualTypeOf<Matrix3>()
    expect(E).toHaveLength(3)
    for (const row of E) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it.each(dates)('should have a determinant of 1 at %s, e.g., as it is a proper rotation', when => {
    expect(doDeterminant(getEquatorialToEclipticMatrix(new Date(when)))).toBeCloseTo(1, 15)
  })

  it.each(dates)('should be orthogonal at %s, e.g., E · Eᵀ = Eᵀ · E = I', when => {
    const E = getEquatorialToEclipticMatrix(new Date(when))

    const EEᵀ = getMatrixProduct(E, doTranspose(E))

    const EᵀE = getMatrixProduct(doTranspose(E), E)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(EEᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(EᵀE[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it.each(dates)('should equal R1(ε) of the true obliquity of the ecliptic at %s', when => {
    const ε = getTrueObliquityOfTheEcliptic(new Date(when))

    expect(getEquatorialToEclipticMatrix(new Date(when))).toEqual(getRotationMatrix('x', ε))
  })

  it('should leave the true equinox of the date fixed, e.g., the x-axis is common to both', () => {
    const { x, y, z } = getRotatedCartesianCoordinate(getEquatorialToEclipticMatrix(datetime), {
      x: 1,
      y: 0,
      z: 0
    })

    expect(x).toBe(1)
    expect(y).toBe(0)
    expect(z).toBe(0)
  })

  it('should carry the celestial pole to an ecliptic coordinate of (90°, 90° − ε)', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    // N.B. The ecliptic longitude, λ, and latitude, β, are resolved as the right ascension and
    // declination of the vector in the ecliptic frame:
    const { ra: λ, dec: β } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(getEquatorialToEclipticMatrix(datetime), { x: 0, y: 0, z: 1 })
    )

    expect(λ).toBeCloseTo(90, 10)
    expect(β).toBeCloseTo(90 - ε, 10)
  })

  it('should carry the ecliptic pole, at (270°, 90° − ε), to an ecliptic latitude of 90°', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { z } = getRotatedCartesianCoordinate(
      getEquatorialToEclipticMatrix(datetime),
      convertEquatorialToCartesian({ ra: 270, dec: 90 - ε })
    )

    expect(z).toBeCloseTo(1, 15)
  })

  it('should carry the solstice, at (90°, ε), onto the ecliptic at a longitude of 90°', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { ra: λ, dec: β } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getEquatorialToEclipticMatrix(datetime),
        convertEquatorialToCartesian({ ra: 90, dec: ε })
      )
    )

    expect(λ).toBeCloseTo(90, 10)
    expect(β).toBeCloseTo(0, 10)
  })

  it('should agree with convertEclipticToEquatorial for its transpose across the sphere', () => {
    const Eᵀ = doTranspose(getEquatorialToEclipticMatrix(datetime))

    for (const λ of [0, 30, 90, 135.5, 180, 247.25, 270, 333.3]) {
      for (const β of [-89, -60, -23.4, 0, 5.15, 45, 89]) {
        const { ra, dec } = convertEclipticToEquatorial(datetime, { λ, β })

        // N.B. The ecliptic coordinate is resolved to a unit vector in the ecliptic frame as an
        // equatorial coordinate would be, e.g., λ in place of the right ascension, and β in place
        // of the declination:
        const rotated = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(Eᵀ, convertEquatorialToCartesian({ ra: λ, dec: β }))
        )

        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: rotated.dec, φ: rotated.ra }
        )

        expect(separation).toBeLessThan(1e-10)
      }
    }
  })

  it('should be undone by its transpose, e.g., Eᵀ (E v) = v, back to the true equator', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const E = getEquatorialToEclipticMatrix(datetime)

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(E),
      getRotatedCartesianCoordinate(E, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should return the same matrix for the same date, and another for another date', () => {
    expect(getEquatorialToEclipticMatrix(datetime)).toEqual(
      getEquatorialToEclipticMatrix(new Date(datetime))
    )
    expect(getEquatorialToEclipticMatrix(datetime)).not.toEqual(
      getEquatorialToEclipticMatrix(new Date('2050-03-20T12:00:00.000Z'))
    )
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getEquatorialToEclipticMatrix(datetime)).not.toBe(
      getEquatorialToEclipticMatrix(datetime)
    )
  })
})

/*****************************************************************************************************************/
