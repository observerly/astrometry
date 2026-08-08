/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getAiryDiskDiameter, getFieldOfView, getFocalRatio } from '../src'

/*****************************************************************************************************************/

// For testing we will fix the aperture to be 0.08m (80mm):
export const apertureWidth = 0.08

// For testing we will fix the focal length to be 0.6m (600mm):
export const focalLength = 0.6

// For testing we will fix the pixel size to be 6.45μm:
export const pixelSize = 6.45e-6

/*****************************************************************************************************************/

describe('getFocalRatio', () => {
  it('should be defined', () => {
    expect(getFocalRatio).toBeDefined()
  })

  it('should return the correct focal ratio for the optics given', () => {
    expect(getFocalRatio(apertureWidth, focalLength)).toBe('f/7.5')
  })

  it('should throw for an aperture that is not greater than zero', () => {
    // The focal ratio is the focal length divided through by the aperture, and so an aperture of
    // zero has no focal ratio:
    expect(() => getFocalRatio(0, focalLength)).toThrow()
    expect(() => getFocalRatio(-apertureWidth, focalLength)).toThrow()
  })

  it('should throw for a focal length that is not greater than zero', () => {
    expect(() => getFocalRatio(apertureWidth, 0)).toThrow()
    expect(() => getFocalRatio(apertureWidth, -focalLength)).toThrow()
  })
})

/*****************************************************************************************************************/

describe('getFieldOfView', () => {
  it('should be defined', () => {
    expect(getFieldOfView).toBeDefined
  })

  it('should return the correct value for a 600mm focal length', () => {
    const fov = getFieldOfView(focalLength, pixelSize, { x: 1392, y: 1040 })
    // 0.86° x 0.64° field of view:
    expect(fov.x).toBe(0.857374044633764)
    expect(fov.y).toBe(0.6405668149562604)
  })

  it('should return the correct value for a 1000mm focal length', () => {
    const fov = getFieldOfView(1.0, pixelSize, { x: 1392, y: 1040 })
    // 0.51° x 0.38° field of view:
    expect(fov.x).toBe(0.5144244267802583)
    expect(fov.y).toBe(0.3843400889737562)
  })

  it('should return the correct value for a 600mm focal length and a 8.25μm pixel size', () => {
    const fov = getFieldOfView(focalLength, 8.25e-6, { x: 1392, y: 1040 })
    // 1.1° x 0.82° field of view:
    expect(fov.x).toBe(1.0966412198803959)
    expect(fov.y).toBe(0.8193296470370773)
  })

  it('should throw for a focal length that is not greater than zero', () => {
    // The angular size of a pixel is its size divided through by the focal length, and so optics of
    // zero focal length have no field of view:
    expect(() => getFieldOfView(0, pixelSize, { x: 1392, y: 1040 })).toThrow()
    expect(() => getFieldOfView(-focalLength, pixelSize, { x: 1392, y: 1040 })).toThrow()
  })

  it('should throw for a pixel size that is not greater than zero', () => {
    expect(() => getFieldOfView(focalLength, 0, { x: 1392, y: 1040 })).toThrow()
    expect(() => getFieldOfView(focalLength, -pixelSize, { x: 1392, y: 1040 })).toThrow()
  })

  it('should throw for a resolution that is not greater than zero', () => {
    expect(() => getFieldOfView(focalLength, pixelSize, { x: 0, y: 1040 })).toThrow()
    expect(() => getFieldOfView(focalLength, pixelSize, { x: 1392, y: 0 })).toThrow()
    expect(() => getFieldOfView(focalLength, pixelSize, { x: -1392, y: 1040 })).toThrow()
  })
})

/*****************************************************************************************************************/

describe('getAiryDiskDiameter', () => {
  it('should be defined', () => {
    expect(getAiryDiskDiameter).toBeDefined()
  })

  it('should resolve the classical rule of thumb for the resolution of a telescope', () => {
    // The resolution of a telescope, in arcseconds, is ~138/D for an aperture D in millimetres,
    // which is the angular radius of the Airy disk, e.g., the Rayleigh criterion of 1.22 λ/D. The
    // diameter is resolved in degrees, and so it is taken to arcseconds to compare against it:
    for (const aperture of [0.1, 0.2, 0.5, 2.4, 6.5]) {
      const radius = (getAiryDiskDiameter(aperture) * 3600) / 2

      expect(radius).toBeCloseTo(138 / (aperture * 1000), 2)
    }
  })

  it('should scale inversely with the aperture', () => {
    expect(getAiryDiskDiameter(0.1)).toBeCloseTo(2 * getAiryDiskDiameter(0.2), 12)
  })

  it('should scale linearly with the wavelength', () => {
    expect(getAiryDiskDiameter(1, 1100e-9)).toBeCloseTo(2 * getAiryDiskDiameter(1, 550e-9), 12)
  })

  it('should resolve the angular diameter in degrees', () => {
    // Every angle the library returns is resolved in degrees, and so the diameter is also, e.g.,
    // the Airy disk of a 100 mm aperture is ~2.77 arcseconds, which is ~7.69e-4 degrees:
    expect(getAiryDiskDiameter(0.1)).toBeCloseTo(((2 * 1.22 * 550e-9) / 0.1) * (180 / Math.PI), 12)

    expect(getAiryDiskDiameter(0.1)).toBeLessThan(1)
  })

  it('should default to the green light at which the eye is most sensitive', () => {
    expect(getAiryDiskDiameter(0.2)).toBe(getAiryDiskDiameter(0.2, 550e-9))
  })

  it('should resolve the diffraction limit of a space telescope', () => {
    // An observer above the atmosphere is not blurred by the seeing, and so the Airy disk is the
    // appearance of a star, e.g., ~0.115 arcseconds in diameter for a 2.4 m aperture:
    expect(getAiryDiskDiameter(2.4) * 3600).toBeCloseTo(0.1153, 4)
  })

  it('should throw for an aperture that is not greater than zero', () => {
    expect(() => getAiryDiskDiameter(0)).toThrow()
    expect(() => getAiryDiskDiameter(-1)).toThrow()
    expect(() => getAiryDiskDiameter(Number.NaN)).toThrow()
    expect(() => getAiryDiskDiameter(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('should throw for a wavelength that is not greater than zero', () => {
    expect(() => getAiryDiskDiameter(1, 0)).toThrow()
    expect(() => getAiryDiskDiameter(1, -550e-9)).toThrow()
    expect(() => getAiryDiskDiameter(1, Number.NaN)).toThrow()
  })
})

/***************************************************************************************************************/
