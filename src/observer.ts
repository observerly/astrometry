/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { EARTH_FLATTENING, EARTH_RADIUS } from './constants'

import type { CartesianCoordinate, GeographicCoordinate, Observer } from './common'

import {
  convertRadiansToDegrees,
  convertRadiansToDegrees as degrees,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

// The square of the first eccentricity of the reference ellipsoid, e², which is the measure of how
// far the ellipsoid departs from a sphere, and which vanishes for a spherical Earth:
const e2 = EARTH_FLATTENING * (2 - EARTH_FLATTENING)

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
 * convertGeographicToGeocentric()
 *
 * Converts the geographic coordinate of an observer to their geocentric position, e.g., their
 * position in the Earth-centered, Earth-fixed (ECEF) frame, whose origin is the center of mass of
 * the Earth, whose z-axis is the axis of rotation, and whose x-axis passes through the intersection
 * of the equator and the prime meridian.
 *
 * @param observer - The geographic coordinate of the observer.
 * @returns The geocentric position of the observer (in SI metres).
 *
 */
export const convertGeographicToGeocentric = (
  observer: GeographicCoordinate
): Required<CartesianCoordinate> => {
  const { latitude, longitude } = observer

  // The height of the observer above the reference ellipsoid (in SI metres):
  const h = observer.elevation ?? 0

  const sinφ = Math.sin(radians(latitude))

  const cosφ = Math.cos(radians(latitude))

  // The radius of curvature of the ellipsoid in the prime vertical, e.g., the distance along the
  // normal to the ellipsoid from the surface to the axis of rotation (in SI metres):
  const N = EARTH_RADIUS / Math.sqrt(1 - e2 * sinφ ** 2)

  return {
    x: (N + h) * cosφ * Math.cos(radians(longitude)),
    y: (N + h) * cosφ * Math.sin(radians(longitude)),
    // The normal to an oblate ellipsoid does not pass through its center, and so the polar term is
    // reduced by the eccentricity, e.g., it is N(1 - e²) and not N:
    z: (N * (1 - e2) + h) * sinφ
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGeocentricToGeographic()
 *
 * Converts the geocentric position of an observer, e.g., their position in the Earth-centered,
 * Earth-fixed (ECEF) frame, to their geographic coordinate, so that an observer given as a position
 * vector, e.g., a spacecraft, may be observed from as any other observer is.
 *
 * @param position - The geocentric position of the observer (in SI metres).
 * @returns The geographic coordinate of the observer.
 *
 */
export const convertGeocentricToGeographic = (
  position: Required<CartesianCoordinate>
): GeographicCoordinate => {
  const { x, y, z } = position

  // The distance of the observer from the axis of rotation (in SI metres):
  const p = Math.hypot(x, y)

  // The polar radius of the reference ellipsoid (in SI metres):
  const b = EARTH_RADIUS * (1 - EARTH_FLATTENING)

  // The parametric latitude of the observer, e.g., the auxiliary angle of Bowring's method, from
  // which the geodetic latitude is recovered:
  let θ = Math.atan2(z * EARTH_RADIUS, p * b)

  let latitude = 0

  // A single pass is exact at the surface of the ellipsoid, but degrades with height, and so the
  // auxiliary angle is refined from the latitude the pass recovers. Two passes converge to the
  // precision of the arithmetic itself, out to a geostationary altitude and beyond:
  for (let i = 0; i < 2; i++) {
    latitude = Math.atan2(
      z + ((e2 * b) / (1 - e2)) * Math.sin(θ) ** 3,
      p - e2 * EARTH_RADIUS * Math.cos(θ) ** 3
    )

    θ = Math.atan2(b * Math.tan(latitude), EARTH_RADIUS)
  }

  // The height above the ellipsoid, in the form that projects the position onto the normal, which
  // is resolved at the poles, where the position has no distance from the axis of rotation:
  const elevation =
    p * Math.cos(latitude) +
    z * Math.sin(latitude) -
    EARTH_RADIUS * Math.sqrt(1 - e2 * Math.sin(latitude) ** 2)

  return {
    latitude: degrees(latitude),
    longitude: degrees(Math.atan2(y, x)),
    elevation
  }
}

/*****************************************************************************************************************/
