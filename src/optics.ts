/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/optics
// @license        Copyright © 2021-2024 observerly

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
