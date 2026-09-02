/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/coordinates
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getGreenwichSiderealTime, getHourAngle, getLocalSiderealTime } from './astrometry'

import type {
  CartesianCoordinate,
  EclipticCoordinate,
  EquatorialCoordinate,
  GalacticCoordinate,
  GeographicCoordinate,
  HorizontalCoordinate
} from './common'
import { EARTH_RADIUS } from './constants'

import { getTrueObliquityOfTheEcliptic } from './ecliptic'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * convertEclipticToEquatorial()
 *
 * Performs the conversion from Ecliptic to Equatorial coordinates for a given
 * datetime and target (observer agnostic).
 *
 * N.B. The conversion is about the true obliquity of the ecliptic, e.g., the mean obliquity of
 * the date corrected for the nutation in obliquity, and so an ecliptic coordinate of the date is
 * referred to the true equator and equinox of the date.
 *
 * @param date - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param target - The ecliptical coordinate of the observed object.
 * @returns The equatorial coordinates of the target
 *
 */
export const convertEclipticToEquatorial = (
  datetime: Date,
  target: EclipticCoordinate
): EquatorialCoordinate => {
  // Get the true obliquity of the ecliptic for the given datetime:
  const ε = radians(getTrueObliquityOfTheEcliptic(datetime))

  const λ = radians(target.λ)

  const β = radians(target.β)

  const α = Math.atan2(Math.sin(λ) * Math.cos(ε) - Math.tan(β) * Math.sin(ε), Math.cos(λ))

  const δ = Math.asin(Math.sin(β) * Math.cos(ε) + Math.cos(β) * Math.sin(ε) * Math.sin(λ))

  return {
    ra: degrees(α) < 0 ? degrees(α) + 360 : degrees(α),
    dec: degrees(δ)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGalacticToEquatorial()
 *
 * @param target - The galactic coordinate of the observed object.
 * @returns The equatorial coordinates of the target in J2000.0
 *
 */
export const convertGalacticToEquatorial = (target: GalacticCoordinate): EquatorialCoordinate => {
  let { ra, dec } = { ra: 0, dec: 0 }

  // Define the Right Ascenation equatorial coordinate of the galactic north pole, at J2000.0
  const α0 = radians(192.8598)

  // Define Declination the equatorial coordinate of the galactic north pole, at J2000.0
  const δ0 = radians(27.128027)

  // Define the galactic longitude of the ascending node of the galactic equator on the ecliptic, at J2000.0
  const N0 = radians(32.9319)

  // Convert the galactic coordinate, b,, to radians:
  const b = radians(target.b)

  // Convert the galactic coordinate, l, to radians:
  const l = radians(target.l)

  // Calculate the declination of the target:
  dec = degrees(
    Math.asin(Math.cos(b) * Math.cos(δ0) * Math.sin(l - N0) + Math.sin(b) * Math.sin(δ0))
  )

  // Calculate the denominator of the right ascension of the target:
  const y = Math.cos(b) * Math.cos(l - N0)

  // Calculate the numerator of the right ascension of the target:
  const x = Math.sin(b) * Math.cos(δ0) - Math.cos(b) * Math.sin(δ0) * Math.sin(l - N0)

  // Calculate the right ascension of the target, adjusting for the quadrant:
  ra = degrees(Math.atan2(y, x) + α0) % 360

  if (ra < 0) {
    ra += 360
  }

  return {
    ra,
    dec
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertEquatorialToHorizontal()
 *
 * Performs the conversion from Equatorial to Horizontal coordinates for a given
 * datetime, observer, and target.
 *
 * @param date - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @returns The horizontal coordinates of the target
 *
 */
export const convertEquatorialToHorizontal = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate & { distance?: number }
): HorizontalCoordinate => {
  const { latitude, longitude, elevation = 0 } = observer

  const declination = radians(target.dec)

  const R = EARTH_RADIUS

  // N.B. The cosine of the latitude does not vanish for any finite latitude, e.g., it is ~6.1e-17
  // at ±90°, where the altitude resolves to the declination of the target through the ordinary
  // path, and a latitude that is not finite, e.g., NaN or ±Infinity, propagates through it as NaN:

  // Get the hour angle for the target:
  const ha = radians(getHourAngle(datetime, longitude, target.ra))

  // Calculate the altitude of the target, ensuring it is within the range -π/2 to π/2 for arcsin,
  // i.e., between [-1, 1]. This accounts for the observer's target being directly overhead, e.g., at the zenith,
  // or directly below the observer, e.g., at the nadir.
  const altitude = Math.asin(
    Math.max(
      -1,
      Math.min(
        1,
        Math.sin(declination) * Math.sin(radians(latitude)) +
          Math.cos(declination) * Math.cos(radians(latitude)) * Math.cos(ha)
      )
    )
  )

  const azimuth = Math.acos(
    Math.max(
      -1,
      Math.min(
        1,
        (Math.sin(declination) - Math.sin(radians(latitude)) * Math.sin(altitude)) /
          (Math.cos(radians(latitude)) * Math.cos(altitude))
      )
    )
  )

  // The topocentric correction for the diurnal parallax of the target, e.g., the displacement of a
  // nearby object as seen from the surface of the Earth, rather than from its center (in radians):
  let parallax = 0

  if (target.distance !== undefined && target.distance > 0) {
    // For nearby objects, the horizontal parallax (p) is the angle subtended at the target by the
    // geocentric distance of the observer (in radians):
    const p = Math.asin(Math.min(1, (R + Math.max(0, elevation)) / target.distance))

    // The parallax displaces the target along its vertical circle, towards the horizon, and so it
    // is at a maximum at the horizon and vanishes at the zenith. The azimuth is unaffected:
    parallax = p * Math.cos(altitude)
  }

  // N.B. The elevation of the observer does not displace the target: it depresses the observer's
  // horizon, e.g., getLocalHorizon(), which the horizon-relative predicates apply to the horizon
  // they compare the altitude of the target against:
  return {
    alt: degrees(altitude - parallax),
    az: Math.sin(ha) > 0 ? 360 - degrees(azimuth) : degrees(azimuth)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertHorizontalToEquatorial()
 *
 * Performs the conversion from Horizontal to Equatorial coordinates for a given
 * datetime, observer, and target.
 *
 * @param datetime - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param observer - The geographic coordinate of the observer.
 * @param target - The horizontal coordinate of the observed object.
 * @returns The equatorial coordinates of the target
 */
export const convertHorizontalToEquatorial = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: HorizontalCoordinate
): EquatorialCoordinate => {
  const { latitude, longitude } = observer

  const altitude = radians(target.alt)
  const azimuth = radians(target.az)

  // Calculate the declination (in radians) for the target:
  const dec = Math.asin(
    Math.sin(radians(latitude)) * Math.sin(altitude) +
      Math.cos(radians(latitude)) * Math.cos(altitude) * Math.cos(azimuth)
  )

  // Calculate the hour angle (in radians) for the target:
  let ha = Math.atan2(
    (-Math.sin(azimuth) * Math.cos(altitude)) / Math.cos(dec),
    (Math.sin(altitude) - Math.sin(radians(latitude)) * Math.sin(dec)) /
      (Math.cos(radians(latitude)) * Math.cos(dec))
  )

  // Adjust the hour angle for the observer's longitude:
  if (ha < 0) {
    ha += 2 * Math.PI
  }

  // Calculate the Local Sidereal Time (LST) for the observer:
  const LST = getLocalSiderealTime(datetime, longitude)

  // Calculate the Right Ascension (in degrees) for the target:
  let ra = LST * 15 - degrees(ha)

  // Adjust the angle to be within the range 0° to 360°:
  if (ra < 0) {
    ra += 360
  }

  return {
    ra: ra % 360,
    dec: degrees(dec)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGeocentricToGeographic()
 *
 * Performs the conversion from a geocentric equatorial cartesian position to the geographic
 * coordinate of the observer at that position, e.g., the coordinate of the point on the surface
 * of the Earth directly beneath them, together with their elevation above it.
 *
 * The position is given in the geocentric equatorial frame, e.g., the frame an ephemeris resolves
 * the position of a satellite in, with the x-axis towards the vernal equinox, the z-axis along the
 * rotational axis of the Earth, and the origin at its center (in SI metres).
 *
 * N.B. The latitude is resolved against a spherical Earth, e.g., it is the geocentric latitude,
 * which is the figure of the Earth everywhere else in the library, and the elevation is taken
 * above the radius given, e.g., an observer of a different figure of the Earth gives the radius
 * of it.
 *
 * @param datetime - The date and time of the observation, which orients the Earth beneath the position.
 * @param position - The geocentric equatorial cartesian position of the observer (in SI metres).
 * @param radius - The radius of the Earth (in SI metres). Defaults to the equatorial radius.
 * @throws An error if any component of the position is not finite, or the position is at the center of the Earth.
 * @throws An error if the radius is not finite, or is not greater than zero.
 * @returns The geographic coordinate of the observer, e.g., { latitude, longitude, elevation }.
 *
 */
export const convertGeocentricToGeographic = (
  datetime: Date,
  position: Required<CartesianCoordinate>,
  radius: number = EARTH_RADIUS
): GeographicCoordinate => {
  const { x, y, z } = position

  // A position with a component that is not finite has no direction to resolve a coordinate from:
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    throw new Error('Invalid position: each of the x, y and z components must be finite')
  }

  // The distance of the position from the center of the Earth (in SI metres):
  const distance = Math.hypot(x, y, z)

  // Every direction meets at the center of the Earth, and so a position there is above no one
  // point of the surface:
  if (distance === 0) {
    throw new Error('Invalid position: the position must not be at the center of the Earth')
  }

  if (!Number.isFinite(radius)) {
    throw new Error('Invalid radius: the radius must be finite')
  }

  if (radius <= 0) {
    throw new Error('Invalid radius: the radius must be greater than zero')
  }

  // The latitude of the position, e.g., its angle from the plane of the equator, which is taken
  // against the distance from the axis of rotation, and not as the arc sine of the polar
  // component, which is ill-conditioned towards the poles:
  const latitude = degrees(Math.atan2(z, Math.hypot(x, y)))

  // The right ascension of the position, e.g., its angle from the vernal equinox, in the plane of
  // the equator (in degrees):
  const ra = degrees(Math.atan2(y, x))

  // The Earth rotates beneath the equatorial frame, and so the meridian of the position is the
  // angle between it and the meridian of Greenwich, which lies at the Greenwich Sidereal Time,
  // e.g., the hour angle of the vernal equinox at Greenwich (in hours, of 15 degrees each). The
  // longitude is taken the shorter of the two ways about the sphere, e.g., positive towards the
  // east of Greenwich and negative towards the west of it:
  const longitude =
    getNormalizedAzimuthalDegree(ra - getGreenwichSiderealTime(datetime) * 15 + 180) - 180

  return {
    latitude,
    longitude,
    elevation: distance - radius
  }
}

/*****************************************************************************************************************/
