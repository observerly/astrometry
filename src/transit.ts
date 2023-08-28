/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/transit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import {
  type HorizontalCoordinate,
  type EquatorialCoordinate,
  type GeographicCoordinate,
  isEquatorialCoordinate,
  isHorizontalCoordinate
} from './common'
import { convertEquatorialToHorizontal } from './coordinates'

import { getNormalizedInclinationDegree, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

export interface Parameters {
  Ar: number
  H1: number
}

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

/**
 *
 * isBodyAboveHorizon()
 *
 * An object is above the horizon if it is above the observer's horizon at the time of observation.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial or horizontal coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns a boolean indicating whether the target is above the horizon for the observer's location and for the time of observation.
 *
 */
export const isBodyAboveHorizon = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate | HorizontalCoordinate,
  horizon: number = 0
): boolean => {
  let alt = -Infinity

  // Is the target an equatorial coordinate?
  if (isEquatorialCoordinate(target)) {
    const hz = convertEquatorialToHorizontal(datetime, observer, target)
    // We only need to consider the altitude of the target object:
    alt = hz.alt
  }

  // Is the target a horizontal coordinate?
  if (isHorizontalCoordinate(target)) {
    // We only need to consider the altitude of the target object:
    alt = target.alt
  }

  // If the object's altitude is greater than the observer's horizon,
  // then the object is visible (ever above the observer's horizon).
  return alt > horizon
}

/*****************************************************************************************************************/

/**
 *
 * doesBodyRiseOrSet()
 *
 * An object rises or sets if it is above the observer's horizon at the time of observation.
 *
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial or horizontal coordinate of the observed object.
 * @returns false if the object never rises or sets for the observer, otherwise returns the Ar and H1 transit parameters.
 *
 */
export const doesBodyRiseOrSet = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): false | Parameters => {
  // We only need to consider the latitude of the observer:
  const { latitude } = observer

  // We only need to consider the declination of the target object:
  const { dec } = target

  // If |Ar| > 1, the object will never rise or set for the observer.
  const Ar = Math.sin(radians(dec)) / Math.cos(radians(latitude))

  if (Math.abs(Ar) > 1) {
    return false
  }

  // If |H1| > 1, the object will never rise or set for the observer.
  const H1 = Math.tan(radians(latitude)) * Math.tan(radians(dec))

  if (Math.abs(H1) > 1) {
    return false
  }

  return {
    Ar,
    H1
  }
}

/*****************************************************************************************************************/
