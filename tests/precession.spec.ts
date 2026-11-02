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
  getPrecessionMatrix,
  getRotatedCartesianCoordinate,
  getRotationMatrix,
  IDENTITY_MATRIX,
  type Matrix3,
  convertDegreesToRadians as radians
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

  // The mean place of the date of each target, as the precession matrix of ERFA (bp06) resolves
  // it, e.g., without the frame bias, for the Terrestrial Time of each instant (in degrees):
  it.each([
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      mean: { ra: 279.06939511623375, dec: 38.76624791835364 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      mean: { ra: 312.510232615696, dec: -89.03389036819215 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'the north celestial pole',
      ra: 123.4,
      dec: 90,
      mean: { ra: 359.87311997106474, dec: 89.89035478752609 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'the south celestial pole',
      ra: 123.4,
      dec: -90,
      mean: { ra: 179.87311997106173, dec: -89.89035478752609 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'a target near the north celestial pole',
      ra: 0,
      dec: 89.9999,
      mean: { ra: 359.8730056914652, dec: 89.89025478776546 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      mean: { ra: 279.6564154951439, dec: 38.82956557221254 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      mean: { ra: 326.4283441993437, dec: -88.73617657837842 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'the north celestial pole',
      ra: 123.4,
      dec: 90,
      mean: { ra: 180.32100617852447, dec: 89.72047504555813 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'the south celestial pole',
      ra: 123.4,
      dec: -90,
      mean: { ra: 0.32100617852567104, dec: -89.72047504555815 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'a target near the north celestial pole',
      ra: 0,
      dec: 89.9999,
      mean: { ra: 180.32089079030519, dec: 89.72057504397422 }
    }
  ])('should agree with the mean place of ERFA for $name at $datetime', reference => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
      new Date(reference.datetime),
      reference
    )

    // N.B. The separation is taken, rather than the difference in right ascension, which is
    // stretched by 1 / cos δ towards the poles, and is degenerate at them:
    const separation = getAngularSeparation(
      { θ: reference.dec + dec, φ: reference.ra + ra },
      { θ: reference.mean.dec, φ: reference.mean.ra }
    )

    // N.B. The precession angles of P03 and the Fukushima-Williams angles of bp06 agree to within
    // ~1e-12 radians, e.g., ~0.2 µas, and so 1e-9° is ~3.6 µas:
    expect(separation).toBeLessThan(1e-9)
  })

  it.each(['1980-04-22T06:00:00.000Z', '2021-05-14T00:00:00.000Z', '2050-03-20T12:00:00.000Z'])(
    'should carry the north celestial pole of J2000.0 to a declination of 90° − |θ| at %s',
    when => {
      const { θ } = getPrecessionAngles(new Date(when))

      const { dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(new Date(when), {
        ra: 0,
        dec: 90
      })

      expect(90 + dec).toBeCloseTo(90 - Math.abs(θ), 10)
    }
  )

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

  // The displacements of the frame bias matrix of ERFA (bp00) applied to each coordinate, with the
  // displacement in right ascension taken within (−180°, 180°] (in degrees):
  it.each([
    {
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      Δra: 7.960843277032836e-6,
      Δdec: 1.128917666903817e-6
    },
    {
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      Δra: -0.00024444056407446624,
      Δdec: -2.0994190492729103e-6
    },
    {
      name: 'the origin of right ascension',
      ra: 0,
      dec: 0,
      Δra: 4.055555393733812e-6,
      Δdec: -4.615872547704916e-6
    },
    {
      name: 'a target just west of the origin of right ascension',
      ra: 359.99,
      dec: -10,
      Δra: 3.7214109056549205e-6,
      Δdec: -4.615541865149453e-6
    }
  ])(
    'should agree with the frame bias of ERFA to 12 decimal places for $name',
    ({ ra, dec, Δra, Δdec }) => {
      const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

      expect(correction.ra).toBeCloseTo(Δra, 12)
      expect(correction.dec).toBeCloseTo(Δdec, 12)
    }
  )

  it.each([
    { pole: 'north', dec: 90, Δra: -101.08815375555523, Δdec: -4.989424411405707e-6 },
    { pole: 'south', dec: -90, Δra: 78.91184616537294, Δdec: 4.989424411405707e-6 }
  ])(
    'should carry the $pole celestial pole onto the pole of the mean frame of J2000.0',
    ({ dec, Δra, Δdec }) => {
      // N.B. The right ascension of a pole is degenerate, and so the displacement in right
      // ascension is that of the right ascension given, 123.4°, to that of the ICRS pole in the
      // mean frame of J2000.0, e.g., ~22.31° in the north and ~202.31° in the south:
      const correction = getCorrectionToEquatorialForFrameBias({ ra: 123.4, dec })

      expect(correction.ra).toBeCloseTo(Δra, 8)
      expect(correction.dec).toBeCloseTo(Δdec, 12)
    }
  )

  it('should displace no direction by more than the ~23.147 mas of the whole frame bias', () => {
    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-90, -89.9, -52.69566111, -10, 0, 7.4070639, 45, 89.26410897, 90]) {
        const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

        // N.B. The separation is taken, rather than the displacement in right ascension, which is
        // stretched by 1 / cos δ towards the poles:
        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: dec + correction.dec, φ: ra + correction.ra }
        )

        expect(separation * 3600 * 1000).toBeLessThan(23.148)
      }
    }
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
