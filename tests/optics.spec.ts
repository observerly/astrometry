/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getFieldOfView } from '../src'

/*****************************************************************************************************************/

// For testing we will fix the aperture to be 0.08m (80mm):
export const apertureWidth = 0.08

// For testing we will fix the focal length to be 0.6m (600mm):
export const focalLength = 0.6

// For testing we will fix the pixel size to be 6.45μm:
export const pixelSize = 6.45e-6

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
})

/*****************************************************************************************************************/
