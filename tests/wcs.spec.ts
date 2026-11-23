/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/wcs
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { convertPixelToWorldCoordinateSystem, type SIP2DParameters, type WCS } from '../src'

/*****************************************************************************************************************/

describe('convertPixelToWorldCoordinateSystem', () => {
  it('should be defined', () => {
    expect(convertPixelToWorldCoordinateSystem).toBeDefined()
  })

  it('should convert pixel coordinates to equatorial coordinates correctly without SIP transformations', () => {
    const wcs = {
      crpix: { x: 200, y: 200 },
      crval: { ra: 0, dec: 0 },
      cd11: 0.2,
      cd12: 30,
      cd21: 0.2,
      cd22: 0.2,
      E: 0,
      F: 0
    } satisfies WCS

    const pixel = { x: 100, y: 100 }

    const equatorial = convertPixelToWorldCoordinateSystem(wcs, pixel)

    expect(equatorial).toEqual({ ra: 220, dec: -40 })
  })

  it('should convert pixel coordinates to equatorial coordinates correctly with SIP transformations', () => {
    const sip = {
      AOrder: 2,
      BOrder: 2,
      APower: {
        A_1_0: 0,
        A_0_1: 0,
        A_1_1: 2.47110429124e-7,
        A_2_0: 6.71868472834e-7,
        A_0_2: 2.8223469986e-7
      },
      BPower: {
        B_1_0: 0,
        B_0_1: 0,
        B_1_1: 2.47110429124e-7,
        B_2_0: 6.71868472834e-7,
        B_0_2: 2.8223469986e-7
      }
    } satisfies SIP2DParameters

    const wcs = {
      crpix: { x: 200, y: 200 },
      crval: { ra: 0, dec: 0 },
      cd11: 0.2,
      cd12: 30,
      cd21: 0.2,
      cd22: 0.2,
      E: 0,
      F: 0,
      SIP: sip
    } satisfies WCS

    const pixel = { x: 100, y: 100 }

    const equatorial = convertPixelToWorldCoordinateSystem(wcs, pixel)

    expect(equatorial.ra).toBeCloseTo(220.36, 1)
    expect(equatorial.dec).toBeCloseTo(-39.99, 1)
  })

  // A WCS whose declination is simply the pixel offset in the y-dimension, in degrees:
  const wcs = {
    crpix: { x: 0, y: 0 },
    crval: { ra: 0, dec: 0 },
    cd11: 0,
    cd12: 0,
    cd21: 0,
    cd22: 1,
    E: 0,
    F: 0
  } satisfies WCS

  it('should convert a pixel at the north celestial pole to a declination of +90 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(wcs, { x: 0, y: 90 }).dec).toBe(90)
  })

  it('should convert a pixel at the south celestial pole to a declination of -90 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(wcs, { x: 0, y: -90 }).dec).toBe(-90)
  })

  it('should clamp a declination beyond the north celestial pole to +90 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(wcs, { x: 0, y: 91 }).dec).toBe(90)
    expect(convertPixelToWorldCoordinateSystem(wcs, { x: 0, y: 180 }).dec).toBe(90)
  })

  it('should clamp a declination beyond the south celestial pole to -90 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(wcs, { x: 0, y: -91 }).dec).toBe(-90)
    expect(convertPixelToWorldCoordinateSystem(wcs, { x: 0, y: -180 }).dec).toBe(-90)
  })

  // A WCS whose right ascension is simply the pixel offset in the x-dimension, in degrees:
  const ra = {
    crpix: { x: 0, y: 0 },
    crval: { ra: 0, dec: 0 },
    cd11: 1,
    cd12: 0,
    cd21: 0,
    cd22: 0,
    E: 0,
    F: 0
  } satisfies WCS

  it('should resolve a tiny negative right ascension to 0 degrees and not 360 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(ra, { x: -1e-15, y: 0 }).ra).toBe(0)
    expect(convertPixelToWorldCoordinateSystem(ra, { x: -1e-300, y: 0 }).ra).toBe(0)
    expect(convertPixelToWorldCoordinateSystem(ra, { x: -Number.MIN_VALUE, y: 0 }).ra).toBe(0)
  })

  it('should resolve a right ascension of a whole number of revolutions to 0 degrees', () => {
    for (const x of [-1080, -720, -360, 0, 360, 720, 1080]) {
      expect(convertPixelToWorldCoordinateSystem(ra, { x, y: 0 }).ra).toBe(0)
    }
  })

  it('should wrap a negative right ascension into the range 0 to 360 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(ra, { x: -1, y: 0 }).ra).toBe(359)
    expect(convertPixelToWorldCoordinateSystem(ra, { x: -90, y: 0 }).ra).toBe(270)
    expect(convertPixelToWorldCoordinateSystem(ra, { x: -361, y: 0 }).ra).toBe(359)
  })

  it('should wrap a right ascension beyond 360 degrees into the range 0 to 360 degrees', () => {
    expect(convertPixelToWorldCoordinateSystem(ra, { x: 361, y: 0 }).ra).toBe(1)
    expect(convertPixelToWorldCoordinateSystem(ra, { x: 450, y: 0 }).ra).toBe(90)
    expect(convertPixelToWorldCoordinateSystem(ra, { x: 719, y: 0 }).ra).toBe(359)
  })

  it('should keep the right ascension within the range 0 to 360 degrees', () => {
    for (let x = -1080; x <= 1080; x += 0.5) {
      for (const offset of [-1e-13, -1e-15, 0, 1e-15, 1e-13]) {
        const { ra: α } = convertPixelToWorldCoordinateSystem(ra, { x: x + offset, y: 0 })

        expect(α).toBeGreaterThanOrEqual(0)
        expect(α).toBeLessThan(360)
      }
    }
  })

  it('should return a NaN right ascension for a NaN pixel', () => {
    expect(convertPixelToWorldCoordinateSystem(ra, { x: Number.NaN, y: 0 }).ra).toBeNaN()
  })
})

/*****************************************************************************************************************/
