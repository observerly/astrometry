/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getFieldOfView, getFocalRatio } from '../src'

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
