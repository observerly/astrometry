/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/optics
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { CartesianCoordinate } from './common'

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
  if (apertureWidth <= 0) {
    throw new Error('Invalid focal ratio as aperture is not greater than zero')
  }

  if (focalLength <= 0) {
    throw new Error('Invalid focal ratio as focal length is not greater than zero')
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
  if (focalLength <= 0) {
    throw new Error('Invalid field of view as focal length is not greater than zero')
  }

  // Check that the pixel size is a sensible number, e.g., > 0:
  if (pixelSize <= 0) {
    throw new Error('Invalid field of view as pixel size is not greater than zero')
  }

  // Check that the resolution is a sensible number, e.g., > 0:
  if (resolution.x <= 0 || resolution.y <= 0) {
    throw new Error('Invalid field of view as resolution is not greater than zero')
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

/**
 *
 * getAiryDiskDiameter()
 *
 * The Airy disk is the diffraction pattern a circular aperture forms of a point source, e.g., of a
 * star, and its angular diameter is the resolution the optics are capable of. It is the appearance
 * of a star for an observer above the atmosphere, for whom the seeing does not blur it further.
 *
 * The diameter is taken to the first minimum of the pattern, e.g., the first dark ring, which
 * subtends 2.44 λ/D, and within which ~84% of the light of the source falls. The angular radius,
 * 1.22 λ/D, is the Rayleigh criterion, e.g., the separation at which two sources are resolved.
 *
 * @param apertureWidth - The aperture of the optics (in SI metres).
 * @param wavelength - The wavelength of the light observed (in SI metres). Defaults to 550e-9, e.g.,
 * the green light at which the eye is most sensitive.
 * @returns The angular diameter of the Airy disk (in degrees).
 *
 */
export function getAiryDiskDiameter(apertureWidth: number, wavelength = 550e-9): number {
  // Check that the aperture is a sensible number, e.g., > 0:
  if (!Number.isFinite(apertureWidth) || apertureWidth <= 0) {
    throw new Error('Invalid Airy disk as aperture is not greater than zero')
  }

  // Check that the wavelength is a sensible number, e.g., > 0:
  if (!Number.isFinite(wavelength) || wavelength <= 0) {
    throw new Error('Invalid Airy disk as wavelength is not greater than zero')
  }

  // The first minimum of the diffraction pattern of a circular aperture is at 1.22 λ/D, and so the
  // diameter to it is twice that (in radians):
  const θ = (2 * 1.22 * wavelength) / apertureWidth

  // Return the angular diameter (in degrees):
  return degrees(θ)
}

/*****************************************************************************************************************/
