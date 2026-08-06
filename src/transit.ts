/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/transit
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  type GeographicCoordinate,
  type HorizontalCoordinate,
  isEquatorialCoordinate,
  isHorizontalCoordinate
} from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getNight } from './night'

import { getLocalHorizon } from './observer'

import {
  convertGreenwichSiderealTimeToUniversalTime,
  convertLocalSiderealTimeToGreenwichSiderealTime
} from './temporal'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

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

export interface TransitInstance {
  /**
   *
   *
   * The date and time of rise or set.
   *
   *
   */
  datetime: Date
  /**
   *
   *
   * The local sidereal time of rise or set.
   *
   *
   */
  LST: number
  /**
   *
   *
   * The Greenwich sidereal time of rise or set.
   *
   */
  GST: number
  /**
   *
   *
   * The local azimuthal angle (in degrees) of the object at rise or set.
   *
   */
  az: number
}

/*****************************************************************************************************************/

export const isTransitInstance = (value: unknown): value is TransitInstance => {
  if (typeof value === 'boolean' || typeof value !== 'object' || value === null) {
    return false
  }

  const { datetime, LST, GST, az } = value as TransitInstance

  if (!(datetime instanceof Date)) {
    return false
  }

  if (typeof LST !== 'number') {
    return false
  }

  if (typeof GST !== 'number') {
    return false
  }

  if (typeof az !== 'number') {
    return false
  }

  return true
}

/*****************************************************************************************************************/

/**
 *
 * isBodyCircumpolar()
 *
 * An object is considered circumpolar if it is always above the observer's horizon
 * and never sets. This is true when the altitude of the object at its lower
 * culmination is greater than the observer's horizon.
 *
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns a boolean indicating whether the target is circumpolar.
 */
export const isBodyCircumpolar = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon = 0
): boolean => {
  // We only need to consider the latitude of the observer:
  const { latitude } = observer

  // We only need to consider the declination of the target object:
  const { dec } = target

  // The elevation of the observer depresses their local horizon below the astronomical horizon:
  const h = horizon - getLocalHorizon(observer.elevation ?? 0)

  // A star is circumpolar for an observer when it never sets, e.g., when the altitude it reaches at
  // its lower culmination, |θ + δ| - 90, still exceeds the observer's horizon. The star circles
  // whichever celestial pole lies above that horizon, which is not necessarily the pole of the
  // hemisphere the observer stands in, e.g., an observer on the equator sees the stars closest to
  // either pole circle it without ever setting below a sufficiently depressed horizon:
  return Math.abs(latitude + dec) - 90 > h
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
  horizon = 0
): boolean => {
  // We only need to consider the latitude of the observer:
  const { latitude } = observer

  // We only need to consider the declination of the target object:
  const { dec } = target

  // The elevation of the observer depresses their local horizon below the astronomical horizon:
  const h = horizon - getLocalHorizon(observer.elevation ?? 0)

  // Calculate the maximum altitude at culmination, and if that is greater than the observer's horizon,
  // then the object is going to be visible at some future time.
  return 90 - Math.abs(latitude - dec) > h
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
  horizon = 0
): boolean => {
  let alt = Number.NEGATIVE_INFINITY

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

  // The elevation of the observer depresses their local horizon below the astronomical horizon,
  // and so an object is visible down to the depressed horizon:
  const depression = getLocalHorizon(observer.elevation ?? 0)

  // If the object's altitude is greater than the observer's horizon,
  // then the object is visible (ever above the observer's horizon).
  return alt > horizon - depression
}

/*****************************************************************************************************************/

/**
 *
 * doesBodyRiseOrSet()
 *
 * An object both rises and sets if it crosses the observer's horizon, e.g., it is neither
 * circumpolar nor perpetually below the horizon. This is a purely geometric condition on the
 * latitude of the observer, the declination of the object and the horizon, and so the result
 * does not depend on the time of observation.
 *
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns false if the object never rises or sets for the observer, otherwise returns the Ar and H1 transit parameters.
 *
 */
export const doesBodyRiseOrSet = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon = 0
): false | Parameters => {
  // We only need to consider the latitude of the observer:
  const { latitude } = observer

  // We only need to consider the declination of the target object:
  const { dec } = target

  // The elevation of the observer depresses their local horizon below the astronomical horizon,
  // and so the object rises earlier, and sets later, than it does at sea level:
  const h = horizon - getLocalHorizon(observer.elevation ?? 0)

  // The object rises and sets where it crosses the observer's horizon, and so both of the transit
  // parameters are resolved at that altitude, and not at the astronomical horizon:
  const sinh = Math.sin(radians(h))

  // The object never rises or sets for the observer unless |Ar| ≤ 1:
  const Ar =
    (Math.sin(radians(dec)) - sinh * Math.sin(radians(latitude))) /
    (Math.cos(radians(h)) * Math.cos(radians(latitude)))

  // The object never rises or sets for the observer unless |H1| ≤ 1:
  const H1 =
    (Math.sin(radians(latitude)) * Math.sin(radians(dec)) - sinh) /
    (Math.cos(radians(latitude)) * Math.cos(radians(dec)))

  // The conditions are negated so that a parameter that is not a finite number does not satisfy
  // them, e.g., where the denominator vanishes for an observer at a pole, or for an object at a
  // pole, and so a body without a resolvable rise and set neither rises nor sets:
  if (!(Math.abs(Ar) <= 1) || !(Math.abs(H1) <= 1)) {
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
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns the transit for the body, or undefined if the body never rises or sets for the observer.
 *
 */
export const getBodyTransit = (
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon = 0
): Transit | undefined => {
  // Convert the right ascension to hours:
  const ra = target.ra / 15

  // Get the transit parameters, resolved at the observer's horizon:
  const body = doesBodyRiseOrSet(observer, target, horizon)

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

/**
 *
 * getBodyNextRise()
 *
 * Determines the next rise time for an object, if at all.
 *
 * @param date - The date to start searching for the next rise.
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns The next rise time or False if the object never rises, or True if the object is always above the horizon (circumpolar) for the observer.
 */
export const getBodyNextRise = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon = 0
): TransitInstance | false => {
  const tomorrow = new Date(
    Date.UTC(
      datetime.getUTCFullYear(),
      datetime.getUTCMonth(),
      datetime.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  )

  // If the object is circumpolar, or it is not visible from the observer's location, it never rises:
  if (isBodyCircumpolar(observer, target, horizon) || !isBodyVisible(observer, target, horizon)) {
    return false
  }

  const transit = getBodyTransit(observer, target, horizon)

  // The transit of a body is resolved at the horizon of the observer, and depends only on the
  // observer and the target, and not on the datetime, so if the body has no transit for the
  // observer it has no transit on any subsequent day either. The body is visible at culmination,
  // and so it is always above the horizon, and therefore never rises across it:
  if (!transit) {
    return false
  }

  const LSTr = transit.LSTr

  // Convert the local sidereal time of rise to Greenwich sidereal time:
  const GSTr = convertLocalSiderealTimeToGreenwichSiderealTime(LSTr, observer)

  // Convert the Greenwich sidereal time to universal coordinate time for the date specified:
  const rise = convertGreenwichSiderealTimeToUniversalTime(GSTr, datetime)

  // If the rise is before the current time, then we know the next rise is tomorrow:
  if (rise.getTime() < datetime.getTime()) {
    return getBodyNextRise(tomorrow, observer, target, horizon)
  }

  return {
    datetime: rise,
    LST: transit.LSTr,
    GST: GSTr,
    az: transit.R
  }
}

/*****************************************************************************************************************/

/**
 *
 * getBodyNextSet()
 *
 * Determines the next set time for an object, if at all.
 *
 * @param date - The date to start searching for the next set.
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns The next set time or False if the object never sets, or True if the object is always above the horizon (circumpolar) for the observer.
 */
export const getBodyNextSet = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon = 0
): TransitInstance | boolean => {
  const tomorrow = new Date(
    Date.UTC(
      datetime.getUTCFullYear(),
      datetime.getUTCMonth(),
      datetime.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  )

  // If the object is circumpolar, it never sets:
  if (isBodyCircumpolar(observer, target, horizon)) {
    return true
  }

  // If the object is never visible, it never sets:
  if (!isBodyVisible(observer, target, horizon)) {
    return false
  }

  const transit = getBodyTransit(observer, target, horizon)

  // The transit of a body is resolved at the horizon of the observer, and depends only on the
  // observer and the target, and not on the datetime, so if the body has no transit for the
  // observer it has no transit on any subsequent day either. A body that is never above the
  // horizon is returned above, and so the body here is visible at culmination, and as it never
  // crosses the horizon it is always above it, and therefore never sets:
  if (!transit) {
    return true
  }

  const LSTs = transit.LSTs

  // Convert the local sidereal time of set to Greenwich sidereal time:
  const GSTs = convertLocalSiderealTimeToGreenwichSiderealTime(LSTs, observer)

  // Convert the Greenwich sidereal time to universal coordinate time for the date specified:
  const set = convertGreenwichSiderealTimeToUniversalTime(GSTs, datetime)

  // If the set is before the current time, then we know the next set is tomorrow:
  if (set < datetime) {
    return getBodyNextSet(tomorrow, observer, target, horizon)
  }

  return {
    datetime: set,
    LST: transit.LSTs,
    GST: GSTs,
    az: transit.S
  }
}

/*****************************************************************************************************************/

/**
 *
 * isBodyVisibleForNight()
 *
 * Determines whether an object is visible at some point during the night.
 *
 * @param date - The date to start searching for the next set.
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @param horizon - The observer's horizon (in degrees).
 * @returns a boolean indicating whether the object is visible at some point during the night.
 *
 */
export const isBodyVisibleForNight = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  horizon = 0
): boolean => {
  // Set the datetime to be at midnight UTC for the date specified, taking a copy of the
  // datetime so as to not modify the date given by the caller, and deriving the day
  // boundary in UTC so as to be independent of the timezone of the host system:
  const midnight = new Date(
    Date.UTC(datetime.getUTCFullYear(), datetime.getUTCMonth(), datetime.getUTCDate(), 0, 0, 0, 0)
  )

  // If the object is never visible, it never rises:
  if (!isBodyVisible(observer, target, horizon)) {
    return false
  }

  // If the object is circumpolar, it never sets:
  if (isBodyCircumpolar(observer, target, horizon)) {
    return true
  }

  // Get night for the date specified:
  const { start, end } = getNight(midnight, observer)

  // If we are at the poles, then there is (potentially) no night:
  if (!start || !end) {
    return false
  }

  // Loop over the night to determine whether the object is visible at some point during the night:
  while (start <= end) {
    // If the object is above the horizon at any point during the night, then it is visible:
    if (isBodyAboveHorizon(start, observer, target, horizon)) {
      return true
    }

    // Increment the time by 1 minute:
    start.setMinutes(start.getMinutes() + 1)
  }

  // If the rise or set is within the night, then the object is visible for the night:
  return false
}

/*****************************************************************************************************************/
