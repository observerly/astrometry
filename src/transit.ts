/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/transit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type EquatorialCoordinate, type GeographicCoordinate } from './common'

import { getNormalizedInclinationDegree } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * isBodyCircumpolar()
 *
 * An object is considered circumpolar if it is always above the observer's horizon
 * and never sets. This is true when the object's declination is greater than 90
 * degrees minus the observer's latitude.
 *
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns a boolean indicating whether the target is circumpolar.
 */
export const isBodyCircumpolar = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon: number = 0
): boolean => {
  // We only need to consider the latitude of the observer:
  const { latitude } = observer

  // We only need to consider the declination of the target object:
  const { dec } = target

  const extrema = 90 - Math.abs(latitude) - horizon

  // If the object's declination is greater than 90 degrees minus the observer's latitude,
  // then the object is circumpolar (always above the observer's horizon and never sets).
  return latitude >= 0 ? dec > extrema : dec < extrema
}

/*****************************************************************************************************************/

/**
 *
 * isBodyVisible()
 *
 * An object is visible if it is ever above the observer's horizon. This is true when
 * the object's declination is greater than the observer's latitude minus 90 degrees.
 *
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns a boolean indicating whether the target is ever visible for the observer.
 */
export const isBodyVisible = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon: number = 0
): boolean => {
  // We only need to consider the latitude of the observer:
  const { latitude } = observer

  // We only need to consider the declination of the target object:
  const { dec } = target

  const extrema = getNormalizedInclinationDegree(90 - (latitude - horizon) + dec)

  // If the object's declination is greater than 90 degrees minus the observer's latitude,
  // then the object is visible (ever above the observer's horizon).
  return extrema > 0 && extrema !== 0
}

/*****************************************************************************************************************/
