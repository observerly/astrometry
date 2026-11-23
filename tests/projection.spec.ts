/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/projection
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertHorizontalToPolar,
  convertHorizontalToStereo,
  convertPolarToHorizontal,
  convertStereoToHorizontal
} from '../src'

/*****************************************************************************************************************/

describe('convertHorizontalToStereo', () => {
  it('should be defined', () => {
    expect(convertHorizontalToStereo).toBeDefined()
  })

  it('should return the correct Cartesian Coordinate { x, y } conversion to the stereographic projection', () => {
    const { x, y } = convertHorizontalToStereo(
      {
        az: 180,
        alt: 61.52543906847783
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(1000)
  })

  it('should project the antipode of the center of the projection to the point at infinity', () => {
    const extent = { width: 2000, height: 2000 }

    // The antipode of the center of the projection (due south on the horizon) is the point on the
    // horizon due north of the observer, which the stereographic projection sends to infinity:
    expect(convertHorizontalToStereo({ az: 0, alt: 0 }, extent)).toEqual({
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY
    })

    expect(convertHorizontalToStereo({ az: 360, alt: 0 }, extent)).toEqual({
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY
    })
  })

  it('should project a point that rounds onto the antipode to the point at infinity', () => {
    const extent = { width: 2000, height: 2000 }

    // These points lie so close to the antipode that the scale factor of the projection overflows:
    for (const target of [
      { az: 1e-9, alt: 0 },
      { az: 0, alt: 1e-9 },
      { az: -1e-9, alt: -1e-9 }
    ]) {
      expect(convertHorizontalToStereo(target, extent)).toEqual({
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY
      })
    }
  })

  it('should project points near to the antipode to finite coordinates', () => {
    const extent = { width: 2000, height: 2000 }

    for (const target of [
      { az: 1, alt: 0 },
      { az: 359, alt: 0 },
      { az: 0, alt: 1 },
      { az: 0, alt: -1 }
    ]) {
      const { x, y } = convertHorizontalToStereo(target, extent)

      expect(Number.isFinite(x)).toBe(true)
      expect(Number.isFinite(y)).toBe(true)
    }
  })

  it('should never return a NaN coordinate for a finite horizontal coordinate', () => {
    const extent = { width: 2000, height: 2000 }

    for (let az = 0; az <= 360; az += 15) {
      for (let alt = -90; alt <= 90; alt += 15) {
        const { x, y } = convertHorizontalToStereo({ az, alt }, extent)

        expect(Number.isNaN(x)).toBe(false)
        expect(Number.isNaN(y)).toBe(false)
      }
    }
  })

  it('should return NaN for a NaN horizontal coordinate', () => {
    const extent = { width: 2000, height: 2000 }

    const { x, y } = convertHorizontalToStereo({ az: Number.NaN, alt: Number.NaN }, extent)

    expect(x).toBeNaN()
    expect(y).toBeNaN()
  })
})

/*****************************************************************************************************************/

describe('convertStereoToHorizontal', () => {
  it('should be defined', () => {
    expect(convertStereoToHorizontal).toBeDefined()
  })

  it('should return the correct Horizontal Coordinate { az, alt } conversion from the stereographic projection', () => {
    const { az, alt } = convertStereoToHorizontal(
      {
        x: 1000,
        y: 1000
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(az).toBeCloseTo(180)
    expect(alt).toBeCloseTo(61.525439)
  })

  it('should invert convertHorizontalToStereo for the default focus', () => {
    const extent = { width: 2000, height: 2000 }

    // The forward and the inverse projection share the same default focus, and so the projection
    // round trips without the focus having to be given explicitly:
    for (const target of [
      { az: 45, alt: 5 },
      { az: 90, alt: 30 },
      { az: 180, alt: 61.525439 },
      { az: 245, alt: 15 },
      { az: 359, alt: 75 }
    ]) {
      const { az, alt } = convertStereoToHorizontal(
        convertHorizontalToStereo(target, extent),
        extent
      )

      expect(az).toBeCloseTo(target.az)
      expect(alt).toBeCloseTo(target.alt)
    }
  })

  it('should return the center of the projection for the center of the canvas', () => {
    const extent = { width: 2000, height: 2000 }

    // The center of the projection is the point on the horizon due south of the observer, which the
    // forward projection maps to the bottom center of the canvas:
    const { x, y } = convertHorizontalToStereo({ az: 180, alt: 0 }, extent)

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(2000)

    const { az, alt } = convertStereoToHorizontal({ x, y }, extent)

    expect(az).toBe(180)
    expect(alt).toBe(0)
  })

  it('should return an azimuth of 0° and not 360° for a point due north', () => {
    const extent = { width: 2000, height: 2000 }

    for (const alt of [10, 45, 78, 80, 85, 89]) {
      const { az } = convertStereoToHorizontal(
        convertHorizontalToStereo({ az: 0, alt }, extent),
        extent
      )

      expect(az).toBeCloseTo(0)
    }
  })

  it('should resolve an azimuth of 360° to an azimuth of 0°', () => {
    const extent = { width: 2000, height: 2000 }

    const { az, alt } = convertStereoToHorizontal(
      convertHorizontalToStereo({ az: 360, alt: 80 }, extent),
      extent
    )

    expect(az).toBeCloseTo(0)
    expect(alt).toBeCloseTo(80)
  })

  it('should return an azimuth within [0°, 360°) across the whole sky', () => {
    const extent = { width: 2000, height: 2000 }

    for (let az = 0; az < 360; az += 1) {
      for (const alt of [5, 30, 60, 78, 85]) {
        const horizontal = convertStereoToHorizontal(
          convertHorizontalToStereo({ az, alt }, extent),
          extent
        )

        expect(horizontal.az).toBeGreaterThanOrEqual(0)
        expect(horizontal.az).toBeLessThan(360)
      }
    }
  })

  it('should invert convertHorizontalToStereo across the whole sky', () => {
    const extent = { width: 2000, height: 2000 }

    for (let az = 0; az < 360; az += 15) {
      for (const alt of [5, 15, 30, 45, 60, 75, 85]) {
        const horizontal = convertStereoToHorizontal(
          convertHorizontalToStereo({ az, alt }, extent),
          extent
        )

        expect(horizontal.az).toBeCloseTo(az)
        expect(horizontal.alt).toBeCloseTo(alt)
      }
    }
  })

  it('should invert the point at infinity to the antipode of the center of the projection', () => {
    const extent = { width: 2000, height: 2000 }

    for (const cartesian of [
      { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY },
      { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
      { x: Number.NEGATIVE_INFINITY, y: 1000 },
      { x: 1000, y: Number.POSITIVE_INFINITY }
    ]) {
      expect(convertStereoToHorizontal(cartesian, extent)).toEqual({ az: 0, alt: 0 })
    }
  })

  it('should invert convertHorizontalToStereo at the antipode of the center of the projection', () => {
    const extent = { width: 2000, height: 2000 }

    const { az, alt } = convertStereoToHorizontal(
      convertHorizontalToStereo({ az: 0, alt: 0 }, extent),
      extent
    )

    expect(az).toBe(0)
    expect(alt).toBe(0)
  })

  it('should return NaN for a NaN cartesian coordinate', () => {
    const extent = { width: 2000, height: 2000 }

    const { az, alt } = convertStereoToHorizontal({ x: Number.NaN, y: Number.NaN }, extent)

    expect(az).toBeNaN()
    expect(alt).toBeNaN()
  })
})

/*****************************************************************************************************************/

describe('convertHorizontalToPolar', () => {
  it('should be defined', () => {
    expect(convertHorizontalToPolar).toBeDefined()
  })

  it('should map the zenith to the center of the projection', () => {
    const { x, y } = convertHorizontalToPolar(
      {
        az: 0,
        alt: 90
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(1000)
  })

  it('should return the correct Cartesian Coordinate { x, y } conversion to the polar projection', () => {
    const { x, y } = convertHorizontalToPolar(
      {
        az: 180,
        alt: 45
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(1420)
  })
})

/*****************************************************************************************************************/

describe('convertPolarToHorizontal', () => {
  it('should be defined', () => {
    expect(convertPolarToHorizontal).toBeDefined()
  })

  it('should return the correct Horizontal Coordinate { az, alt } conversion from the polar projection', () => {
    const { az, alt } = convertPolarToHorizontal(
      {
        x: 1000,
        y: 1420
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(az).toBeCloseTo(180)
    expect(alt).toBeCloseTo(45)
  })

  it('should invert convertHorizontalToPolar for an arbitrary horizontal coordinate', () => {
    const extent = { width: 2000, height: 2000 }

    const cartesian = convertHorizontalToPolar({ az: 245, alt: 30 }, extent, 0.42)

    const { az, alt } = convertPolarToHorizontal(cartesian, extent, 0.42)

    expect(az).toBeCloseTo(245)
    expect(alt).toBeCloseTo(30)
  })

  it('should return an azimuth of 0° and not 360° for a point due north', () => {
    const extent = { width: 2000, height: 2000 }

    const { az, alt } = convertPolarToHorizontal(
      convertHorizontalToPolar({ az: 0, alt: 45 }, extent),
      extent
    )

    expect(az).toBe(0)
    expect(alt).toBeCloseTo(45)
  })

  it('should return an azimuth of 0° and not 360° for a point due north at any altitude', () => {
    const extent = { width: 2000, height: 2000 }

    for (const alt of [0, 10, 45, 80, 89]) {
      const { az } = convertPolarToHorizontal(
        convertHorizontalToPolar({ az: 0, alt }, extent),
        extent
      )

      expect(az).toBeCloseTo(0)
    }
  })

  it('should resolve an azimuth of 360° to an azimuth of 0°', () => {
    const extent = { width: 2000, height: 2000 }

    const { az, alt } = convertPolarToHorizontal(
      convertHorizontalToPolar({ az: 360, alt: 45 }, extent),
      extent
    )

    expect(az).toBe(0)
    expect(alt).toBeCloseTo(45)
  })

  it('should return an azimuth within [0°, 360°) across the whole sky', () => {
    const extent = { width: 2000, height: 2000 }

    for (let az = 0; az < 360; az += 1) {
      for (const alt of [0, 30, 45, 60, 85]) {
        const horizontal = convertPolarToHorizontal(
          convertHorizontalToPolar({ az, alt }, extent),
          extent
        )

        expect(horizontal.az).toBeGreaterThanOrEqual(0)
        expect(horizontal.az).toBeLessThan(360)
      }
    }
  })

  it('should invert convertHorizontalToPolar across the whole sky', () => {
    const extent = { width: 2000, height: 2000 }

    for (let az = 0; az < 360; az += 15) {
      for (const alt of [0, 15, 30, 45, 60, 75, 85]) {
        const horizontal = convertPolarToHorizontal(
          convertHorizontalToPolar({ az, alt }, extent),
          extent
        )

        expect(horizontal.az).toBeCloseTo(az)
        expect(horizontal.alt).toBeCloseTo(alt)
      }
    }
  })

  it('should return an altitude of 90° for the center of the projection', () => {
    const extent = { width: 2000, height: 2000 }

    const { alt } = convertPolarToHorizontal({ x: 1000, y: 1000 }, extent)

    expect(alt).toBe(90)
  })
})

/*****************************************************************************************************************/
