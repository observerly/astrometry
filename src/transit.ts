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

import {
  getNormalizedInclinationDegree,
  convertDegreesToRadians as radians,
  convertRadiansToDegrees as degrees
} from './utilities'

/*****************************************************************************************************************/

export interface Parameters {
  Ar: number
  H1: number
}

/*****************************************************************************************************************/

export interface Transit {
  /**
   *
   *
   * The local sidereal time of rise.
   *
   *
   */
  LSTr: number
  /**
   *
   *
   * The local sidereal time of set.
   *
   *
   */
  LSTs: number
  /**
   *
   *
   * The azimuthal angle (in degrees) of the object at rise.
   *
   *
   */
  R: number
  /**
   *
   *
   * The azimuthal angle (in degrees) of the object at set.
   *
   *
   */
  S: number
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

/**
 *
 * getBodyTransit()
 *
 * Determines the local sidereal time and azimuthal angle of rise and set for an object.
 *
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial or horizontal coordinate of the observed object.
 * @returns the transit for the body, or undefined if the body never rises or sets for the observer.
 *
 */
export const getBodyTransit = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): Transit | undefined => {
  // Convert the right ascension to hours:
  const ra = target.ra / 15

  // Get the transit parameters:
  const body = doesBodyRiseOrSet(observer, target)

  if (!body) {
    return undefined
  }

  // Extract the transit parameters from the body:
  const { H1, Ar } = body

  const H2 = degrees(Math.acos(-H1)) / 15

  // Get the azimuthal angle of rise:
  const R = degrees(Math.acos(Ar))

  // Get the azimuthal angle of set:
  const S = 360 - R

  // The local sidereal time of rise:
  let LSTr = 24 + ra - H2

  if (LSTr > 24) {
    LSTr -= 24
  }

  // The local sidereal time of set:
  let LSTs = ra + H2

  if (LSTs > 24) {
    LSTs -= 24
  }

  return {
    LSTr,
    LSTs,
    R,
    S
  }
}

/*****************************************************************************************************************/
