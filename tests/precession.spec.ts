/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
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
  getCorrectionToEquatorialForFrameBias,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getFrameBiasMatrix,
  getMatrixProduct,
  getPrecessionAngles,
  getRotatedCartesianCoordinate,
  IDENTITY_MATRIX,
  type Matrix3
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing
const polaris: EquatorialCoordinate = { ra: 37.95454961, dec: 89.264113893 }

/*****************************************************************************************************************/

describe('getPrecessionAngles', () => {
  it('should be defined', () => {
    expect(getPrecessionAngles).toBeDefined()
  })

  // The equatorial precession angles of IAU 2006, as eraP06e of the IAU Standards of Fundamental Astronomy (SOFA)
  // resolves them, for the Terrestrial Time of each instant (in degrees):
  it.each([
    {
      datetime: '2000-01-01T12:00:00.000Z',
      ζ: 0.000736275528526131,
      z: -0.0007362494715080268,
      θ: 1.1322950652280641e-8
    },
    {
      datetime: '2021-05-14T00:00:00.000Z',
      ζ: 0.13759858640121758,
      z: 0.13613576917705666,
      θ: 0.11893666567219895
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      ζ: 0.32242391945022586,
      z: 0.3210061653867071,
      θ: 0.27952495446101727
    }
  ])('should return the precession angles of eraP06e at $datetime', reference => {
    const { ζ, z, θ } = getPrecessionAngles(new Date(reference.datetime))

    expect(ζ).toBeCloseTo(reference.ζ, 10)
    expect(z).toBeCloseTo(reference.z, 10)
    expect(θ).toBeCloseTo(reference.θ, 10)
  })

  it('should return the offsets of the precession angles at J2000.0, e.g., ζ and z are equal and opposite', () => {
    const { ζ, z, θ } = getPrecessionAngles(new Date('2000-01-01T11:58:55.816Z'))

    expect(ζ * 3600).toBeCloseTo(2.650545, 6)
    expect(z * 3600).toBeCloseTo(-2.650545, 6)
    expect(θ * 3600).toBeCloseTo(0, 6)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForPrecessionOfEquinoxes', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForPrecessionOfEquinoxes).toBeDefined()
  })

  it('should return the correct precession correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
      new Date('2000-01-01T12:00:00+00:00'),
      polaris
    )
    expect(ra + polaris.ra).toBeCloseTo(37.95454961)
    expect(dec + polaris.dec).toBeCloseTo(89.264113893)
  })

  it('should return the correct precession correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, polaris)
    expect(ra + polaris.ra).toBeCloseTo(44.745273328264, 9)
    expect(dec + polaris.dec).toBeCloseTo(89.35354192194684, 9)
  })

  it.each([{ ra: 10 }, { ra: 200 }, { ra: 359.9 }])(
    'should return a small correction free of any ±360° branch-cut jump for a target at ra $ra',
    ({ ra: targetRA }) => {
      const target: EquatorialCoordinate = { ra: targetRA, dec: 45 }

      const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
        new Date('2026-07-22T00:00:00.000+00:00'),
        target
      )

      // Precession accumulates ~0.36° over the ~26 years since J2000, so the
      // correction magnitude must be well under 1°:
      expect(Math.abs(ra)).toBeLessThan(1)
      expect(Math.abs(dec)).toBeLessThan(1)

      // Applying the correction (wrapped into [0, 360)) should move the target
      // by only that small amount:
      const corrected = (((target.ra + ra) % 360) + 360) % 360

      let delta = corrected - target.ra
      delta -= 360 * Math.round(delta / 360)

      expect(Math.abs(delta)).toBeLessThan(1)
    }
  )
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForFrameBias', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForFrameBias).toBeDefined()
  })

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639, Δra: 0.0000034608, Δdec: -0.000001991 },
    {
      name: 'Polaris',
      ra: 37.95456067,
      dec: 89.26410897,
      Δra: -0.00010068472,
      Δdec: -0.0000048046
    },
    {
      name: 'Canopus',
      ra: 95.98787778,
      dec: -52.69566111,
      Δra: 0.000010340097,
      Δdec: -0.0000014024
    }
  ])('should agree with the frame bias of ERFA for $name', ({ ra, dec, Δra, Δdec }) => {
    // The displacements are those of the frame bias matrix of ERFA (bp06) applied to the catalogue coordinate:
    const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

    expect(correction.ra).toBeCloseTo(Δra, 9)
    expect(correction.dec).toBeCloseTo(Δdec, 9)
  })

  it.each([{ ra: 0 }, { ra: 359.99 }])(
    'should return a small correction free of any ±360° branch-cut jump for a target at ra $ra',
    ({ ra }) => {
      const correction = getCorrectionToEquatorialForFrameBias({ ra, dec: -10 })

      expect(Math.abs(correction.ra)).toBeLessThan(0.0001)
      expect(Math.abs(correction.dec)).toBeLessThan(0.0001)
    }
  )
})

/*****************************************************************************************************************/

describe('getFrameBiasMatrix', () => {
  // The number of milliarcseconds in a radian, e.g., 180 / π × 3600 × 1000:
  const mas = (180 / Math.PI) * 3600 * 1000

  it('should be defined', () => {
    expect(getFrameBiasMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const B = getFrameBiasMatrix()
    expectTypeOf(B).toEqualTypeOf<Matrix3>()
    expect(B).toHaveLength(3)
    for (const row of B) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it('should have a determinant of 1, e.g., as it is a proper rotation', () => {
    expect(doDeterminant(getFrameBiasMatrix())).toBeCloseTo(1, 15)
  })

  it('should be orthogonal, e.g., B · Bᵀ = Bᵀ · B = I', () => {
    const B = getFrameBiasMatrix()

    const BBᵀ = getMatrixProduct(B, doTranspose(B))

    const BᵀB = getMatrixProduct(doTranspose(B), B)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(BBᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(BᵀB[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it('should be within ~1e-7 of the identity, but not equal to it, e.g., as the bias is of the order of 20 mas', () => {
    const B = getFrameBiasMatrix()

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const offset = Math.abs(B[i][j] - IDENTITY_MATRIX[i][j])
        expect(offset).toBeGreaterThan(0)
        expect(offset).toBeLessThan(1e-7)
      }
    }
  })

  it('should place the ICRS origin of right ascension at (+14.6, −16.617) mas in the mean frame of J2000.0', () => {
    // The ICRS x-axis, e.g., the origin of right ascension of the ICRS, carried into the mean frame of J2000.0,
    // where the mean equinox lies 14.6 mas to the west, e.g., the frame bias in right ascension, δα₀, of −14.6 mas:
    const { ra, dec } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(getFrameBiasMatrix(), { x: 1, y: 0, z: 0 })
    )

    expect(ra * 3600 * 1000).toBeCloseTo(14.6, 5)

    // N.B. The tilt of the pole towards the origin of right ascension, e.g., δψ₀ sin ε₀ of −16.617 mas, also
    // tilts the origin of right ascension below the equator by the same angle:
    expect(dec * 3600 * 1000).toBeCloseTo(
      -41.775 * Math.sin((84381.448 / 3600) * (Math.PI / 180)),
      6
    )
  })

  it('should offset the ICRS pole from the mean pole of J2000.0 by (16.617, 6.8192) mas, e.g., (−δψ₀ sin ε₀, −δε₀)', () => {
    // The ICRS pole, carried into the mean frame of J2000.0, e.g., the third column of the frame bias matrix:
    const { x, y, z } = getRotatedCartesianCoordinate(getFrameBiasMatrix(), { x: 0, y: 0, z: 1 })

    // The frame bias in longitude of −41.775 mas, projected onto the equator by sin ε₀ of IAU 1980:
    expect(x * mas).toBeCloseTo(41.775 * Math.sin((84381.448 / 3600) * (Math.PI / 180)), 6)

    // The frame bias in obliquity of −6.8192 mas:
    expect(y * mas).toBeCloseTo(6.8192, 6)

    // N.B. The pole is tilted by ~18 mas, and so z is its cosine, e.g., 1 − ~3.8e-15:
    expect(z).toBeCloseTo(1, 14)
  })

  it('should displace any direction by no more than the ~23.147 mas of the whole rotation of the frame bias', () => {
    const B = getFrameBiasMatrix()

    // The angle of the whole rotation, e.g., the length of the rotation vector (δα₀, δψ₀ sin ε₀, δε₀) (in mas):
    const limit = Math.hypot(14.6, 41.775 * Math.sin((84381.448 / 3600) * (Math.PI / 180)), 6.8192)

    expect(limit).toBeCloseTo(23.147, 3)

    for (const ra of [0, 45, 88.7929583, 137.25, 180, 279.23473479, 333.3]) {
      for (const dec of [-89.9, -52.69566111, 0, 7.4070639, 38.78368896, 89.26410897]) {
        const biased = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(B, convertEquatorialToCartesian({ ra, dec }))
        )

        const separation = getAngularSeparation({ θ: dec, φ: ra }, { θ: biased.dec, φ: biased.ra })

        expect(separation * 3600 * 1000).toBeLessThan(limit + 1e-6)
      }
    }
  })

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639 },
    { name: 'Polaris', ra: 37.95456067, dec: 89.26410897 },
    { name: 'Canopus', ra: 95.98787778, dec: -52.69566111 },
    { name: 'Vega', ra: 279.23473479, dec: 38.78368896 },
    { name: 'σ Octantis', ra: 317.19541667, dec: -88.9565 }
  ])('should agree with getCorrectionToEquatorialForFrameBias for $name', ({ ra, dec }) => {
    const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

    const biased = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(getFrameBiasMatrix(), convertEquatorialToCartesian({ ra, dec }))
    )

    expect(biased.ra).toBeCloseTo(ra + correction.ra, 10)
    expect(biased.dec).toBeCloseTo(dec + correction.dec, 10)
  })

  it('should be undone by its transpose, e.g., Bᵀ (B v) = v, from the mean frame of J2000.0 back to the ICRS', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const B = getFrameBiasMatrix()

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(B),
      getRotatedCartesianCoordinate(B, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should return the same matrix on each call, e.g., as the frame bias is fixed, and not a function of the date', () => {
    expect(getFrameBiasMatrix()).toEqual(getFrameBiasMatrix())
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getFrameBiasMatrix()).not.toBe(getFrameBiasMatrix())
  })
})

/*****************************************************************************************************************/
