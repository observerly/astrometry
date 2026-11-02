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
  convertEquatorialToHorizontal,
  convertGalacticToEquatorial,
  convertHorizontalToEquatorial,
  doDeterminant,
  doTranspose,
  type GeographicCoordinate,
  getAngularSeparation,
  getBiasPrecessionNutationMatrix,
  getCorrectionToEquatorialForFrameBias,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getEquatorialToEclipticMatrix,
  getEquatorialToGalacticMatrix,
  getEquatorialToHorizontalMatrix,
  getFrameBiasMatrix,
  getLocalApparentSiderealTime,
  getMatrixProduct,
  getNutation,
  getNutationMatrix,
  getObliquityOfTheEcliptic,
  getPrecessionAngles,
  getPrecessionMatrix,
  getRotatedCartesianCoordinate,
  getRotationMatrix,
  getTrueObliquityOfTheEcliptic,
  IDENTITY_MATRIX,
  type Matrix3,
  convertDegreesToRadians as radians
} from '../src'

/*****************************************************************************************************************/

import * as frames from '../src/frames'

import * as galactic from '../src/galactic'

import * as nutation from '../src/nutation'

import * as precession from '../src/precession'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

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

  it('should be within ~1e-7 of the identity, but not equal to it, as the bias is ~20 mas', () => {
    const B = getFrameBiasMatrix()

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const offset = Math.abs(B[i][j] - IDENTITY_MATRIX[i][j])
        expect(offset).toBeGreaterThan(0)
        expect(offset).toBeLessThan(1e-7)
      }
    }
  })

  it('should place the ICRS origin of right ascension at (+14.6, −16.617) mas in J2000.0', () => {
    // The ICRS x-axis, e.g., the origin of right ascension of the ICRS, carried into the mean frame
    // of J2000.0,
    // where the mean equinox lies 14.6 mas to the west, e.g., the frame bias in right ascension,
    // δα₀, of −14.6 mas:
    const { ra, dec } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(getFrameBiasMatrix(), { x: 1, y: 0, z: 0 })
    )

    expect(ra * 3600 * 1000).toBeCloseTo(14.6, 5)

    // N.B. The tilt of the pole towards the origin of right ascension, e.g., δψ₀ sin ε₀ of −16.617
    // mas, also
    // tilts the origin of right ascension below the equator by the same angle:
    expect(dec * 3600 * 1000).toBeCloseTo(
      -41.775 * Math.sin((84381.448 / 3600) * (Math.PI / 180)),
      6
    )
  })

  it('should offset the ICRS pole from the J2000.0 pole by (−δψ₀ sin ε₀, −δε₀) mas', () => {
    // The ICRS pole, carried into the mean frame of J2000.0, e.g., the third column of the frame
    // bias matrix:
    const { x, y, z } = getRotatedCartesianCoordinate(getFrameBiasMatrix(), { x: 0, y: 0, z: 1 })

    // The frame bias in longitude of −41.775 mas, projected onto the equator by sin ε₀ of IAU 1980:
    expect(x * mas).toBeCloseTo(41.775 * Math.sin((84381.448 / 3600) * (Math.PI / 180)), 6)

    // The frame bias in obliquity of −6.8192 mas:
    expect(y * mas).toBeCloseTo(6.8192, 6)

    // N.B. The pole is tilted by ~18 mas, and so z is its cosine, e.g., 1 − ~3.8e-15:
    expect(z).toBeCloseTo(1, 14)
  })

  it('should displace any direction by no more than the ~23.147 mas of the frame bias', () => {
    const B = getFrameBiasMatrix()

    // The angle of the whole rotation, e.g., the length of the rotation vector (δα₀, δψ₀ sin ε₀,
    // δε₀) (in mas):
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

  it('should be undone by its transpose, e.g., Bᵀ (B v) = v, back to the ICRS', () => {
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

  it('should return the same matrix on each call, e.g., as the frame bias is fixed', () => {
    expect(getFrameBiasMatrix()).toEqual(getFrameBiasMatrix())
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getFrameBiasMatrix()).not.toBe(getFrameBiasMatrix())
  })
})

/*****************************************************************************************************************/

describe('getPrecessionMatrix', () => {
  // The instant of J2000.0, e.g., 2000-01-01T12:00:00.000 TT, in UTC (TT − UTC = 64.184 seconds):
  const J2000 = new Date('2000-01-01T11:58:55.816Z')

  // The dates across which the precession matrix is resolved, about J2000.0:
  const dates = [
    '1980-04-22T06:00:00.000Z',
    '2000-01-01T12:00:00.000Z',
    '2013-09-22T04:00:00.000Z',
    '2021-05-14T00:00:00.000Z',
    '2026-09-06T00:00:00.000Z',
    '2050-03-20T12:00:00.000Z'
  ]

  it('should be defined', () => {
    expect(getPrecessionMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const P = getPrecessionMatrix(datetime)
    expectTypeOf(P).toEqualTypeOf<Matrix3>()
    expect(P).toHaveLength(3)
    for (const row of P) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it.each(dates)('should have a determinant of 1 at %s, e.g., as it is a proper rotation', when => {
    expect(doDeterminant(getPrecessionMatrix(new Date(when)))).toBeCloseTo(1, 15)
  })

  it.each(dates)('should be orthogonal at %s, e.g., P · Pᵀ = Pᵀ · P = I', when => {
    const P = getPrecessionMatrix(new Date(when))

    const PPᵀ = getMatrixProduct(P, doTranspose(P))

    const PᵀP = getMatrixProduct(doTranspose(P), P)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(PPᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(PᵀP[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it('should be the identity at J2000.0, e.g., as the offsets of ζ and z cancel', () => {
    const P = getPrecessionMatrix(J2000)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(P[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-12)
      }
    }
  })

  it('should not be the identity away from J2000.0, e.g., as it is a function of the date', () => {
    const P = getPrecessionMatrix(datetime)

    // N.B. The equinox of the date has moved by ~1° along the equator of J2000.0 over two decades:
    expect(Math.abs(P[0][1])).toBeGreaterThan(1e-3)
    expect(Math.abs(P[0][2])).toBeGreaterThan(1e-3)
    expect(Math.abs(P[1][0])).toBeGreaterThan(1e-3)
    expect(Math.abs(P[2][0])).toBeGreaterThan(1e-3)
  })

  it('should equal R3(−z) · R2(θ) · R3(−ζ) of the precession angles of the date', () => {
    const { ζ, z, θ } = getPrecessionAngles(datetime)

    const R = getMatrixProduct(
      getRotationMatrix('z', -z),
      getMatrixProduct(getRotationMatrix('y', θ), getRotationMatrix('z', -ζ))
    )

    expect(getPrecessionMatrix(datetime)).toEqual(R)
  })

  it.each(dates)(
    'should place the mean pole of the date θ from the mean pole of J2000.0 at %s',
    when => {
      const { ζ, θ } = getPrecessionAngles(new Date(when))

      // The mean pole of the date, carried back into the mean frame of J2000.0, e.g., the third
      // row of the precession matrix, (sin θ cos ζ, −sin θ sin ζ, cos θ):
      const pole = getRotatedCartesianCoordinate(doTranspose(getPrecessionMatrix(new Date(when))), {
        x: 0,
        y: 0,
        z: 1
      })

      expect(pole.x).toBeCloseTo(Math.sin(radians(θ)) * Math.cos(radians(ζ)), 15)
      expect(pole.y).toBeCloseTo(-Math.sin(radians(θ)) * Math.sin(radians(ζ)), 15)
      expect(pole.z).toBeCloseTo(Math.cos(radians(θ)), 15)

      // N.B. The pole has moved by |θ| along the great circle at a right ascension of −ζ, e.g.,
      // before J2000.0, θ is negative, and the pole of the date lies at a right ascension of
      // 180° − ζ:
      const { ra, dec } = convertCartesianToEquatorial(pole)

      expect(dec).toBeCloseTo(90 - Math.abs(θ), 10)

      if (θ > 1e-6) {
        expect(ra).toBeCloseTo((360 - ζ) % 360, 8)
      }

      if (θ < -1e-6) {
        expect(ra).toBeCloseTo(180 - ζ, 8)
      }
    }
  )

  it('should rotate the frame by the general precession of ~50.288″ over one Julian year', () => {
    // The instant one Julian year after J2000.0, e.g., 2000-12-31T18:00:00.000 TT, in UTC, as 2000
    // is a leap year of 366 days:
    const P = getPrecessionMatrix(new Date('2000-12-31T17:58:55.816Z'))

    // The angle of the whole rotation, from the trace of the matrix, e.g., 1 + 2 cos φ (in
    // arcseconds):
    const φ = (Math.acos((P[0][0] + P[1][1] + P[2][2] - 1) / 2) * 180 * 3600) / Math.PI

    expect(φ).toBeCloseTo(50.288, 3)
  })

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639 },
    { name: 'Polaris', ra: 37.95456067, dec: 89.26410897 },
    { name: 'Canopus', ra: 95.98787778, dec: -52.69566111 },
    { name: 'Vega', ra: 279.23473479, dec: 38.78368896 },
    { name: 'σ Octantis', ra: 317.19541667, dec: -88.9565 }
  ])(
    'should agree with getCorrectionToEquatorialForPrecessionOfEquinoxes for $name',
    ({ ra, dec }) => {
      const correction = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, { ra, dec })

      const precessed = convertCartesianToEquatorial(
        getRotatedCartesianCoordinate(
          getPrecessionMatrix(datetime),
          convertEquatorialToCartesian({ ra, dec })
        )
      )

      // N.B. The separation is taken, rather than the difference in right ascension, which is
      // stretched by 1 / cos δ towards the poles:
      const separation = getAngularSeparation(
        { θ: dec + correction.dec, φ: ra + correction.ra },
        { θ: precessed.dec, φ: precessed.ra }
      )

      expect(separation).toBeLessThan(1e-10)
    }
  )

  it('should be undone by its transpose, e.g., Pᵀ (P v) = v, back to J2000.0', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const P = getPrecessionMatrix(datetime)

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(P),
      getRotatedCartesianCoordinate(P, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should return the same matrix for the same date, and another for another date', () => {
    expect(getPrecessionMatrix(datetime)).toEqual(getPrecessionMatrix(new Date(datetime)))
    expect(getPrecessionMatrix(datetime)).not.toEqual(getPrecessionMatrix(J2000))
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getPrecessionMatrix(datetime)).not.toBe(getPrecessionMatrix(datetime))
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

describe('getEquatorialToGalacticMatrix', () => {
  it('should be defined', () => {
    expect(getEquatorialToGalacticMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const G = getEquatorialToGalacticMatrix()
    expectTypeOf(G).toEqualTypeOf<Matrix3>()
    expect(G).toHaveLength(3)
    for (const row of G) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it('should have a determinant of 1, e.g., as it is a proper rotation', () => {
    expect(doDeterminant(getEquatorialToGalacticMatrix())).toBeCloseTo(1, 15)
  })

  it('should be orthogonal, e.g., G · Gᵀ = Gᵀ · G = I', () => {
    const G = getEquatorialToGalacticMatrix()

    const GGᵀ = getMatrixProduct(G, doTranspose(G))

    const GᵀG = getMatrixProduct(doTranspose(G), G)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(GGᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(GᵀG[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it('should carry the north galactic pole, at (192.85948°, 27.12825°), to b = 90°', () => {
    const { z } = getRotatedCartesianCoordinate(
      getEquatorialToGalacticMatrix(),
      convertEquatorialToCartesian({ ra: 192.85948, dec: 27.12825 })
    )

    expect(z).toBeCloseTo(1, 15)
  })

  it('should carry the galactic centre, at (266.40499°, −28.93617°), to (0°, 0°)', () => {
    // The galactic centre of the Hipparcos definition, referred to the ICRS, as resolved by
    // g2icrs of ERFA for a galactic coordinate of (0°, 0°):
    const { x, y, z } = getRotatedCartesianCoordinate(
      getEquatorialToGalacticMatrix(),
      convertEquatorialToCartesian({ ra: 266.4049948010461, dec: -28.936173960138692 })
    )

    expect(x).toBeCloseTo(1, 14)
    expect(y).toBeCloseTo(0, 14)
    expect(z).toBeCloseTo(0, 14)
  })

  it('should carry the north celestial pole to (l, b) = (122.93192°, 27.12825°)', () => {
    // N.B. The galactic longitude, l, and latitude, b, are resolved as the right ascension and
    // declination of the vector in the galactic frame:
    const { ra: l, dec: b } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(getEquatorialToGalacticMatrix(), { x: 0, y: 0, z: 1 })
    )

    expect(l).toBeCloseTo(122.93192, 10)
    expect(b).toBeCloseTo(27.12825, 10)
  })

  it('should carry the ascending node, at (282.85948°, 0°), to (l, b) = (32.93192°, 0°)', () => {
    // The ascending node of the galactic equator on the celestial equator, 90° east of the north
    // galactic pole in right ascension:
    const { ra: l, dec: b } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getEquatorialToGalacticMatrix(),
        convertEquatorialToCartesian({ ra: 282.85948, dec: 0 })
      )
    )

    expect(l).toBeCloseTo(32.93192, 10)
    expect(b).toBeCloseTo(0, 10)
  })

  // The galactic coordinates of each star, as resolved by icrs2g of ERFA (in degrees):
  it.each([
    {
      name: 'Betelgeuse',
      ra: 88.7929583,
      dec: 7.4070639,
      l: 199.78723977963807,
      b: -8.958588971279083
    },
    {
      name: 'Polaris',
      ra: 37.95456067,
      dec: 89.26410897,
      l: 123.28054437658928,
      b: 26.46139355081295
    },
    {
      name: 'Canopus',
      ra: 95.98787778,
      dec: -52.69566111,
      l: 261.21208561578067,
      b: -25.292252241924412
    },
    {
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      l: 67.44820298814159,
      b: 19.23725244509086
    },
    {
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      l: 303.9052326043725,
      b: -27.713470498059788
    }
  ])('should agree with icrs2g of ERFA for $name', ({ ra, dec, l, b }) => {
    const galactic = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getEquatorialToGalacticMatrix(),
        convertEquatorialToCartesian({ ra, dec })
      )
    )

    expect(galactic.ra).toBeCloseTo(l, 12)
    expect(galactic.dec).toBeCloseTo(b, 12)
  })

  it('should agree with convertGalacticToEquatorial for its transpose to within ~1.5″', () => {
    const Gᵀ = doTranspose(getEquatorialToGalacticMatrix())

    for (let l = 0; l < 360; l += 15) {
      for (const b of [-85, -60, -27.5, 0, 12.25, 45, 85]) {
        const { ra, dec } = convertGalacticToEquatorial({ l, b })

        // N.B. The galactic coordinate is resolved to a unit vector in the galactic frame as an
        // equatorial coordinate would be, e.g., l in place of the right ascension, and b in place
        // of the declination:
        const rotated = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(Gᵀ, convertEquatorialToCartesian({ ra: l, dec: b }))
        )

        // N.B. The conversion takes the north galactic pole at (192.8598°, 27.128027°), rounded
        // from that of the Hipparcos catalogue, which displaces it by up to ~1.43″:
        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: rotated.dec, φ: rotated.ra }
        )

        expect(separation * 3600).toBeLessThan(1.5)
      }
    }
  })

  it('should be undone by its transpose, e.g., Gᵀ (G v) = v, back to the ICRS', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const G = getEquatorialToGalacticMatrix()

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(G),
      getRotatedCartesianCoordinate(G, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should return the same matrix on each call, e.g., as the galactic frame is fixed', () => {
    expect(getEquatorialToGalacticMatrix()).toEqual(getEquatorialToGalacticMatrix())
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getEquatorialToGalacticMatrix()).not.toBe(getEquatorialToGalacticMatrix())
  })
})

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

describe('getEquatorialToHorizontalMatrix', () => {
  // The observers across which the equatorial to horizontal matrix is resolved, e.g., at a spread
  // of latitudes and longitudes in each hemisphere:
  const observers: (GeographicCoordinate & { name: string })[] = [
    { name: 'Mauna Kea', latitude: 19.8207, longitude: -155.4681 },
    { name: 'Greenwich', latitude: 51.4769, longitude: 0 },
    { name: 'Siding Spring', latitude: -31.2733, longitude: 149.0644 },
    { name: 'La Silla', latitude: -29.2567, longitude: -70.7346 },
    { name: 'Svalbard', latitude: 78.2232, longitude: 15.6267 },
    { name: 'the equator', latitude: 0, longitude: 0 }
  ]

  // For testing
  const observer: GeographicCoordinate = { latitude: 51.4769, longitude: 0 }

  it('should be defined', () => {
    expect(getEquatorialToHorizontalMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const H = getEquatorialToHorizontalMatrix(datetime, observer)
    expectTypeOf(H).toEqualTypeOf<Matrix3>()
    expect(H).toHaveLength(3)
    for (const row of H) {
      expect(row).toHaveLength(3)
      for (const element of row) {
        expect(Number.isFinite(element)).toBe(true)
      }
    }
  })

  it.each(observers)(
    'should have a determinant of −1 for $name, e.g., as it is a reflection',
    o => {
      // N.B. The horizontal frame of (north, east, zenith) is left-handed, e.g., the azimuth is
      // measured from the north point towards the east point, and so the matrix is a rotation
      // followed by a reflection of the x-axis:
      expect(doDeterminant(getEquatorialToHorizontalMatrix(datetime, o))).toBeCloseTo(-1, 15)
    }
  )

  it.each(observers)('should be orthogonal for $name, e.g., H · Hᵀ = Hᵀ · H = I', o => {
    const H = getEquatorialToHorizontalMatrix(datetime, o)

    const HHᵀ = getMatrixProduct(H, doTranspose(H))

    const HᵀH = getMatrixProduct(doTranspose(H), H)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(HHᵀ[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
        expect(Math.abs(HᵀH[i][j] - IDENTITY_MATRIX[i][j])).toBeLessThan(1e-15)
      }
    }
  })

  it('should equal F · R2(90° − φ) · R3(LAST), where F reflects the x-axis', () => {
    const LAST = getLocalApparentSiderealTime(datetime, observer.longitude) * 15

    const F: Matrix3 = [
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]

    expect(getEquatorialToHorizontalMatrix(datetime, observer)).toEqual(
      getMatrixProduct(
        F,
        getMatrixProduct(
          getRotationMatrix('y', 90 - observer.latitude),
          getRotationMatrix('z', LAST)
        )
      )
    )
  })

  it.each(observers)('should carry the point at (LAST, φ) to the zenith for $name', o => {
    const LAST = getLocalApparentSiderealTime(datetime, o.longitude) * 15

    const { z } = getRotatedCartesianCoordinate(
      getEquatorialToHorizontalMatrix(datetime, o),
      convertEquatorialToCartesian({ ra: LAST, dec: o.latitude })
    )

    expect(z).toBeCloseTo(1, 15)
  })

  it.each(observers)('should carry the north celestial pole to (0°, φ) for $name', o => {
    const H = getEquatorialToHorizontalMatrix(datetime, o)

    const { x, y, z } = getRotatedCartesianCoordinate(H, { x: 0, y: 0, z: 1 })

    // The pole lies on the meridian, due north, at an altitude of the latitude of the observer:
    expect(y).toBeCloseTo(0, 15)
    expect(x).toBeCloseTo(Math.cos(radians(o.latitude)), 15)
    expect(z).toBeCloseTo(Math.sin(radians(o.latitude)), 15)
  })

  it('should carry a target on the meridian, south of the zenith, to an azimuth of 180°', () => {
    // N.B. The azimuth, A, and the altitude, a, are resolved as the right ascension and
    // declination of the vector in the horizontal frame:
    const LAST = getLocalApparentSiderealTime(datetime, observer.longitude) * 15

    const { ra: A, dec: a } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getEquatorialToHorizontalMatrix(datetime, observer),
        convertEquatorialToCartesian({ ra: LAST, dec: 7.4070639 })
      )
    )

    expect(A).toBeCloseTo(180, 10)
    expect(a).toBeCloseTo(90 - observer.latitude + 7.4070639, 10)
  })

  it('should carry a target rising on the equator to the east point, at (90°, 0°)', () => {
    // A target on the celestial equator at an hour angle of −90°, e.g., six hours before it
    // transits the meridian:
    const LAST = getLocalApparentSiderealTime(datetime, observer.longitude) * 15

    const { ra: A, dec: a } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getEquatorialToHorizontalMatrix(datetime, observer),
        convertEquatorialToCartesian({ ra: LAST + 90, dec: 0 })
      )
    )

    expect(A).toBeCloseTo(90, 10)
    expect(a).toBeCloseTo(0, 10)
  })

  it.each(
    observers.flatMap(o =>
      [
        { star: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639 },
        { star: 'Polaris', ra: 37.95456067, dec: 89.26410897 },
        { star: 'Canopus', ra: 95.98787778, dec: -52.69566111 },
        { star: 'Vega', ra: 279.23473479, dec: 38.78368896 },
        { star: 'σ Octantis', ra: 317.19541667, dec: -88.9565 }
      ].map(target => ({ ...target, observer: o }))
    )
  )('should agree with convertEquatorialToHorizontal for $star at $observer.name', target => {
    const { alt, az } = convertEquatorialToHorizontal(datetime, target.observer, target)

    const { ra: A, dec: a } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(
        getEquatorialToHorizontalMatrix(datetime, target.observer),
        convertEquatorialToCartesian(target)
      )
    )

    // N.B. The separation is taken, rather than the difference in azimuth, which is stretched by
    // 1 / cos a towards the zenith:
    const separation = getAngularSeparation({ θ: alt, φ: az }, { θ: a, φ: A })

    expect(separation).toBeLessThan(1e-9)
  })

  it.each(observers)(
    'should agree with convertHorizontalToEquatorial for its transpose for $name',
    o => {
      const Hᵀ = doTranspose(getEquatorialToHorizontalMatrix(datetime, o))

      for (const az of [0, 45, 90, 135.5, 180, 247.25, 270, 333.3]) {
        for (const alt of [-60, -12, 0, 5.15, 30, 60, 85]) {
          const { ra, dec } = convertHorizontalToEquatorial(datetime, o, { alt, az })

          const rotated = convertCartesianToEquatorial(
            getRotatedCartesianCoordinate(Hᵀ, convertEquatorialToCartesian({ ra: az, dec: alt }))
          )

          const separation = getAngularSeparation(
            { θ: dec, φ: ra },
            { θ: rotated.dec, φ: rotated.ra }
          )

          expect(separation).toBeLessThan(1e-9)
        }
      }
    }
  )

  it('should be undone by its transpose, e.g., Hᵀ (H v) = v, back to the true equator', () => {
    const vega = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })

    const H = getEquatorialToHorizontalMatrix(datetime, observer)

    const { x, y, z } = getRotatedCartesianCoordinate(
      doTranspose(H),
      getRotatedCartesianCoordinate(H, vega)
    )

    expect(x).toBeCloseTo(vega.x, 15)
    expect(y).toBeCloseTo(vega.y, 15)
    expect(z).toBeCloseTo(vega.z, 15)
  })

  it('should carry the target 15° east of the meridian onto it one sidereal hour later', () => {
    const later = new Date(datetime.getTime() + 3600000 / 1.0027379093508)

    const H = getEquatorialToHorizontalMatrix(datetime, observer)

    const Hʹ = getEquatorialToHorizontalMatrix(later, observer)

    // N.B. The Local Apparent Sidereal Time advances by 15° in one sidereal hour, and so the
    // target 15° to the east of the one on the meridian transits it at the same place:
    const LAST = getLocalApparentSiderealTime(datetime, observer.longitude) * 15

    const before = getRotatedCartesianCoordinate(
      H,
      convertEquatorialToCartesian({ ra: LAST, dec: 7.4070639 })
    )

    const after = getRotatedCartesianCoordinate(
      Hʹ,
      convertEquatorialToCartesian({ ra: LAST + 15, dec: 7.4070639 })
    )

    expect(after.x).toBeCloseTo(before.x, 6)
    expect(after.y).toBeCloseTo(before.y, 6)
    expect(after.z).toBeCloseTo(before.z, 6)
  })

  it('should return the same matrix for the same inputs, and another for another observer', () => {
    expect(getEquatorialToHorizontalMatrix(datetime, observer)).toEqual(
      getEquatorialToHorizontalMatrix(new Date(datetime), { ...observer })
    )
    expect(getEquatorialToHorizontalMatrix(datetime, observer)).not.toEqual(
      getEquatorialToHorizontalMatrix(datetime, { latitude: -31.2733, longitude: 149.0644 })
    )
  })

  it('should return a new matrix on each call, and not a shared reference', () => {
    expect(getEquatorialToHorizontalMatrix(datetime, observer)).not.toBe(
      getEquatorialToHorizontalMatrix(datetime, observer)
    )
  })
})

/*****************************************************************************************************************/

describe('the frame matrices of the frames module', () => {
  it('should define every frame matrix in the frames module', () => {
    expect(frames.getFrameBiasMatrix).toBeTypeOf('function')
    expect(frames.getPrecessionMatrix).toBeTypeOf('function')
    expect(frames.getNutationMatrix).toBeTypeOf('function')
    expect(frames.getEquatorialToGalacticMatrix).toBeTypeOf('function')
  })

  it('should not define the frame matrices in the precession, nutation or galactic modules', () => {
    expect(Object.keys(precession)).not.toContain('getFrameBiasMatrix')
    expect(Object.keys(precession)).not.toContain('getPrecessionMatrix')
    expect(Object.keys(nutation)).not.toContain('getNutationMatrix')
    expect(Object.keys(galactic)).not.toContain('getEquatorialToGalacticMatrix')
  })
})

/*****************************************************************************************************************/
