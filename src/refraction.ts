/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/refraction
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type HorizontalCoordinate } from './common'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToHorizontalForRefraction()
 *
 * The correct to the HorizontalCoordinate for refraction is an adjustment to the observed
 * HorizontalCoordinate based on pressure and temperature effects.
 *
 * @param target - The horizontal coordinate of the observed object.
 * @param temperature - The temperature in Kelvin.
 * @param pressure - The pressure in Pascals.
 * @returns The horizontal coordinate of the observed object corrected for atmospheric refraction.
 *
 */
export const getCorrectionToHorizontalForRefraction = (
  target: HorizontalCoordinate,
  temperature: number = 283.15,
  pressure: number = 101325
): HorizontalCoordinate => {
  const { alt, az } = target

  if (alt < 0) {
    return target
  }

  // The pressure, in Pascals:
  const P = pressure

  // The temperature, in Kelvin:
  const T = temperature

  // Get the atmospheric refraction in degrees, corrected for temperature and pressure:
  const R = (1.02 / Math.tan(radians(alt + 10.3 / (alt + 5.11))) / 60) * (P / 101325) * (283.15 / T)

  return {
    alt: alt + R,
    az: az
  }
}

/*****************************************************************************************************************/
