/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/galactic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertCartesianToEquatorial,
  convertEquatorialToCartesian,
  convertGalacticToEquatorial,
  doDeterminant,
  doTranspose,
  getAngularSeparation,
  getEquatorialToGalacticMatrix,
  getMatrixProduct,
  getRotatedCartesianCoordinate,
  IDENTITY_MATRIX,
  type Matrix3
} from '../src'

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
