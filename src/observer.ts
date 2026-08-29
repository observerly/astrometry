/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getLocalSiderealTime } from './astrometry'

import { EARTH_ANGULAR_VELOCITY, EARTH_RADIUS } from './constants'

import type {
  CartesianCoordinate,
  GeographicCoordinate,
  GeographicCoordinateAtEpoch,
  Observer
} from './common'

import { convertRadiansToDegrees, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getLocalHorizon()
 *
 * Calculates the local horizon depression for a given observer (in degrees).
 *
 * @param h - The observer for which to calculate the local horizon depression., or a number representing
 * the observer's elevation above sea level (in SI metres).
 * @param k - The observer's atmospheric refraction (unitless)
 * @returns The local horizon depression (in degrees).
 */
export const getLocalHorizon = (h: number | Observer, k = 0.167): number => {
  let elevation = 0

  // If the observer is an object, extract the elevation:
  if (typeof h !== 'number' && h.elevation) {
    elevation = h.elevation
  }

  if (typeof h === 'number') {
    elevation = h
  }

  // An observer at or below sea level is taken to be at sea level, where the depression vanishes:
  if (elevation <= 0) {
    return 0
  }

  // Return the local horizon depression (in degrees) for the observer:
  // Takes into account refraction (k) if provided, otherwise defaults to 0.167.
  // N.B. The depression is the exact angle subtended, and not its small angle approximation,
  // which diverges for elevations that are an appreciable fraction of the radius of the Earth:
  return convertRadiansToDegrees(Math.acos(EARTH_RADIUS / (EARTH_RADIUS + (1 - k) * elevation)))
}

/*****************************************************************************************************************/

/**
 *
 * getGeocentricRotationalVelocity()
 *
 * Calculates the geocentric equatorial velocity of an observer carried by the rotation of the
 * Earth, e.g., the velocity of an observer at rest at the surface, which carries them towards the
 * east at up to ~465 metres per second at the equator, and which vanishes at the poles.
 *
 * The velocity is resolved in the geocentric equatorial frame, e.g., the frame the velocity of a
 * spacecraft is resolved in, and so it is the velocity an observer at the surface gives to the
 * corrections that take one, e.g., the diurnal aberration is the aberration of this velocity.
 *
 * @param datetime - The date and time of the observation, which orients the observer about the axis of rotation.
 * @param observer - The geographic coordinate of the observer.
 * @returns The geocentric equatorial velocity of the observer (in SI metres per second).
 *
 */
export const getGeocentricRotationalVelocity = (
  datetime: Date,
  observer: GeographicCoordinate
): Required<CartesianCoordinate> => {
  const { latitude, longitude, elevation = 0 } = observer

  // The distance of the observer from the axis of rotation, e.g., the radius of the parallel the
  // rotation carries them about (in SI metres):
  const axial = (EARTH_RADIUS + elevation) * Math.cos(radians(latitude))

  // The speed of the observer along that parallel (in SI metres per second):
  const speed = radians(EARTH_ANGULAR_VELOCITY) * axial

  // The right ascension of the meridian of the observer, e.g., the Local Sidereal Time of the
  // observer (in hours, of 15 degrees each):
  const α = radians(getLocalSiderealTime(datetime, longitude) * 15)

  // The observer is carried towards the east, e.g., along the direction of increasing right
  // ascension at their meridian, which is perpendicular to both the axis of rotation and the
  // direction to the observer:
  return {
    x: -speed * Math.sin(α),
    y: speed * Math.cos(α),
    z: 0
  }
}

/*****************************************************************************************************************/

/**
 *
 * getGeographicCoordinate()
 *
 * Resolves the geographic coordinate of an observer for the epoch of an observation, e.g., an
 * observer given as a coordinate is returned as they are, and one given as a coordinate at an
 * epoch, e.g., a spacecraft resolved from its ephemeris, is resolved for the datetime given.
 *
 * N.B. An observer given as a function is the caller's code, and it is given a copy of the
 * datetime, e.g., a Date is mutable, and a function that mutates the one it is given must not
 * carry that mutation into the datetime of the caller.
 *
 * @param datetime - The date and time of the observation to resolve the observer for.
 * @param observer - The geographic coordinate of the observer, or their coordinate as a function of the epoch.
 * @returns The geographic coordinate of the observer at the epoch of the observation.
 *
 */
export const getGeographicCoordinate = (
  datetime: Date,
  observer: GeographicCoordinate | GeographicCoordinateAtEpoch
): GeographicCoordinate => {
  return typeof observer === 'function' ? observer(new Date(datetime.getTime())) : observer
}

/*****************************************************************************************************************/
