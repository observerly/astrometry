/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/refraction
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { HorizontalCoordinate } from './common'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getRefraction()
 *
 * The refraction correction to the observed object is an adjustment to the observed object
 * based on pressure and temperature effects.
 *
 * N.B. There is no correction for the azimuthal angle.
 *
 * @param target - The horizontal coordinate of the observed object.
 * @param temperature - The temperature in Kelvin.
 * @param pressure - The pressure in Pascals.
 * @returns The refraction correction to the observed object (in degrees).
 *
 */
export const getRefraction = (
  target: HorizontalCoordinate,
  temperature = 283.15,
  pressure = 101325
): number => {
  const { alt } = target

  if (alt < 0) {
    return Number.POSITIVE_INFINITY
  }

  // The pressure, in Pascals:
  const P = pressure

  // The temperature, in Kelvin:
  const T = temperature

  // Get the atmospheric refraction in degrees, corrected for temperature and pressure:
  const R = (1.02 / Math.tan(radians(alt + 10.3 / (alt + 5.11))) / 60) * (P / 101325) * (283.15 / T)

  return R
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToHorizontalForRefraction()
 *
 * The correction to the HorizontalCoordinate for refraction is an adjustment to the observed
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
  temperature = 283.15,
  pressure = 101325
): HorizontalCoordinate => {
  const { alt, az } = target

  if (alt < 0) {
    return target
  }

  // Get the atmospheric refraction in degrees, corrected for temperature and pressure:
  const R = getRefraction(target, temperature, pressure)

  return {
    alt: alt + R,
    az: az
  }
}

/*****************************************************************************************************************/

/**
 *
 * getAirmass()
 *
 * The airmass is the path length of light through the Earth's atmosphere. The airmass is a measure
 * of the amount of atmosphere that light must pass through to reach the observer. The airmass
 * is inversely proportional to the altitude of the observed object, and is at a minimum of ~1 at
 * the zenith, rising to ~38 at the horizon.
 *
 * @see Kasten, F., & Young, A. T. (1989). “Revised Optical Air Mass Tables and Approximation Formula.” Applied Optics, 28(22), 4735–4738.
 *
 * @param target - The horizontal coordinate of the observed object.
 * @returns the airmass of the observed object.
 *
 */
export const getAirmass = (target: HorizontalCoordinate): number => {
  const { alt } = target

  // Below the horizon the light path is not defined, so the airmass is infinite:
  if (alt < 0) {
    return Number.POSITIVE_INFINITY
  }

  // Get the airmass using the Kasten & Young (1989) approximation formula, where the
  // second term corrects for the curvature of the atmosphere at low altitudes:
  return 1 / (Math.sin(radians(alt)) + 0.50572 * (alt + 6.07995) ** -1.6364)
}

/*****************************************************************************************************************/
