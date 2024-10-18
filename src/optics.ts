/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/optics
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { type CartesianCoordinate } from './common'

import { convertRadiansToDegrees as degrees } from './utilities'

/*****************************************************************************************************************/

type FocalRatio = `f/${number}`

/*****************************************************************************************************************/

/**
 *
 * getFocalRatio()
 *
 * @param apertureWidth - the aperture of the optics
 * @param focalLength - the focal length of the optics
 * @returns the focal ratio as a string formatted in the standard focal ratio, e.g., f/x.
 */
export function getFocalRatio(apertureWidth: number, focalLength: number): FocalRatio {
  // Check that the aperterure is a sensible number, e.g., > 0:
  if (apertureWidth < 0) {
    throw new Error(`Invalid focal ratio as aperture is negative`)
  }

  if (focalLength < 0) {
    throw new Error(`Invalid focal ratio as focal length is negative`)
  }

  return `f/${focalLength / apertureWidth}`
}

/*****************************************************************************************************************/

/**
 *
 * getFieldOfView()
 *
 * @param focalLength - the focal length of the optics (in meters)
 * @param pixelSize - the pixel size of the camera (in meters)
 * @param resolution - the resolution of the camera (in pixels)
 * @param binning - the binning of the camera (in pixels)
 * @returns the field of view (FOV) of the camera (in degrees)
 */
export function getFieldOfView(
  focalLength: number,
  pixelSize: number,
  resolution: Omit<CartesianCoordinate, 'z'>
): Omit<CartesianCoordinate, 'z'> {
  // Check that the focal length is a sensible number, e.g., > 0:
  if (focalLength < 0) {
    throw new Error(`Invalid focal ratio as focal length is negative`)
  }

  // Check that the pixel size is a sensible number, e.g., > 0:
  if (pixelSize < 0) {
    throw new Error(`Invalid focal ratio as pixel size is negative`)
  }

  // Check that the resolution is a sensible number, e.g., > 0:
  if (resolution.x < 0 || resolution.y < 0) {
    throw new Error(`Invalid focal ratio as resolution is negative`)
  }

  // Get the angular size of a pixel of the camera (in degrees):
  const θ = degrees(pixelSize / focalLength)

  // Return the field of view (FOV)
  return {
    x: resolution.x * θ,
    y: resolution.y * θ
  }
}

/*****************************************************************************************************************/
