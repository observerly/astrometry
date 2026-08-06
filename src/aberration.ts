/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getHourAngle } from './astrometry'

import type { CartesianCoordinate, EquatorialCoordinate, GeographicCoordinate } from './common'

import { EARTH_RADIUS, c } from './constants'

import { getEccentricityOfOrbit } from './earth'

import { getObliquityOfTheEcliptic } from './ecliptic'

import { getJulianDate } from './epoch'

import {
  getLunarMeanEclipticLongitudeOfTheAscendingNode,
  getLunarMeanGeometricLongitude
} from './moon'

import { getSolarMeanGeometricLongitude, getSolarTrueGeometricLongitude } from './sun'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForAnnualAberration()
 *
 * Corrects the equatorial coordinate of a target for aberration in
 * longitude and obliquity due to the apparent motion of the Earth.
 *
 * @param date - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The corrected equatorial coordinate of the target.
 *
 */
export const getCorrectionToEquatorialForAnnualAberration = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Get the ecliptic longitude of the ascending node of the mode (in degrees):
  const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the mean geometric longitude of the sun (in degrees):
  const L = getSolarMeanGeometricLongitude(datetime)

  // Get the mean geometric longitude of the moon (in degrees):
  const l = getLunarMeanGeometricLongitude(datetime)

  // Get the nutation in obliquity (in degrees):
  const Δε =
    9.2 * Math.cos(radians(Ω)) +
    0.57 * Math.cos(radians(2 * L)) +
    0.1 * Math.cos(radians(2 * l)) -
    0.09 * Math.cos(radians(2 * Ω))

  // Get the true obliquity of the ecliptic (in degrees):
  const ε = radians(getObliquityOfTheEcliptic(datetime) + Δε / 3600)

  // Get the constant of aberration (in degrees):
  const κ = radians(20.49552 / 3600)

  // Get the eccentricity of the Earth's orbit (dimensionless):
  const e = getEccentricityOfOrbit(datetime)

  // Get the longitude of perihelion (in degrees):
  const ϖ = radians(102.93735 + 1.71953 * T + 0.00046 * T ** 2)

  // Get the true geometric longitude of the sun (in degrees):
  const S = radians(getSolarTrueGeometricLongitude(datetime))

  // Calculate the aberration correction in right ascension (in radians):
  const Δra =
    -κ * (Math.cos(ra) * Math.cos(S) * Math.cos(ε) + (Math.sin(ra) * Math.sin(S)) / Math.cos(dec)) +
    e *
      κ *
      (Math.cos(ra) * Math.cos(ϖ) * Math.cos(ε) + (Math.sin(ra) * Math.sin(ϖ)) / Math.cos(dec))

  // Calculate the aberration correction in declination (in radians):
  const Δdec =
    -κ *
      (Math.cos(S) * Math.cos(ε) * (Math.tan(ε) * Math.cos(dec) - Math.sin(ra) * Math.sin(dec)) +
        Math.cos(ra) * Math.sin(dec) * Math.sin(S)) +
    e *
      κ *
      (Math.cos(ϖ) * Math.cos(ε) * (Math.tan(ε) * Math.cos(dec) - Math.sin(ra) * Math.sin(dec)) +
        Math.cos(ra) * Math.sin(dec) * Math.sin(ϖ))

  return {
    ra: degrees(Δra),
    dec: degrees(Δdec)
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForDiurnalAberration()
 *
 * Corrects the equatorial coordinate of a target for aberration in
 * longitude and obliquity due to the apparent motion of the Earth.
 *
 * @param date - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The corrected equatorial coordinate of the target.
 *
 */
export const getCorrectionToEquatorialForDiurnalAberration = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const dec = radians(target.dec)

  const phi = radians(observer.latitude)

  // Get the hour angle for the target (in radians):
  const ha = radians(getHourAngle(datetime, observer.longitude, target.ra))

  // Earth's angular velocity (in rad/s):
  const Ω = 7.292115e-5

  // Calculate the observer's tangential velocity at the equator due to Earth's rotation (in m/s):
  const v = Ω * EARTH_RADIUS

  // The constant of diurnal aberration, e.g., the ratio of the observer's velocity to the speed of
  // light, which is ~0.32 arcseconds for an observer at the equator (in radians):
  const k = v / c

  // The observer is carried eastward by the rotation of the Earth, and so the target is displaced
  // towards the east point of the observer's horizon. The displacement is at a maximum in right
  // ascension when the target is on the observer's meridian, and it vanishes at the poles, where
  // the observer is not carried by the rotation of the Earth at all:
  const Δra = (k * Math.cos(phi) * Math.cos(ha)) / Math.cos(dec)

  // Calculate the aberration correction in declination (in radians):
  const Δdec = k * Math.cos(phi) * Math.sin(ha) * Math.sin(dec)

  return {
    ra: degrees(Δra),
    dec: degrees(Δdec)
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForAberration()
 *
 * Corrects the equatorial coordinate of a target for aberration in
 * longitude and obliquity due to the apparent motion of the Earth.
 *
 * @param date - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The corrected equatorial coordinate of the target.
 *
 */
export const getCorrectionToEquatorialForAberration = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  // Get the annual aberration correction:
  const annual = getCorrectionToEquatorialForAnnualAberration(datetime, target)

  // Get the diurnal aberration correction:
  const diurnal = getCorrectionToEquatorialForDiurnalAberration(datetime, observer, target)

  return {
    ra: annual.ra + diurnal.ra,
    dec: annual.dec + diurnal.dec
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForVelocityAberration()
 *
 * Corrects the equatorial coordinate of a target for the aberration due to the velocity of the
 * observer themselves, e.g., the velocity of a spacecraft in its orbit, which displaces the target
 * towards the direction the observer is travelling in.
 *
 * The correction is the first order aberration of the direction to the target, e.g., v/c resolved
 * along the east and the north of the target, and so it is the same physics as the diurnal
 * aberration of an observer carried by the rotation of the Earth, for a velocity that is not
 * constrained to that rotation. An observer in a low Earth orbit travels at ~7.7 km/s, and so the
 * displacement reaches ~5.3 arcseconds, against the ~0.32 arcseconds of an observer at the equator.
 *
 * @param target - The equatorial coordinate of the target.
 * @param velocity - The velocity of the observer, in the equatorial frame (in SI metres per second).
 * @returns The correction to the equatorial coordinate of the target (in degrees).
 *
 */
export const getCorrectionToEquatorialForVelocityAberration = (
  target: EquatorialCoordinate,
  velocity: Required<CartesianCoordinate>
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // The z component of a cartesian coordinate is optional, and so an observer that gives none is
  // taken to be travelling in the plane of the equator, rather than resolving a displacement that
  // is not a number:
  const { x, y, z = 0 } = velocity

  // The cosine of the declination, e.g., the radius of the parallel of the target as a fraction of
  // the celestial sphere, which is resolved once and used for both of the displacements:
  const cosDec = Math.cos(dec)

  // The velocity of the observer resolved along the east of the target, e.g., along the unit vector
  // (-sin α, cos α, 0), which is the direction of increasing right ascension (in SI metres/second):
  const east = -x * Math.sin(ra) + y * Math.cos(ra)

  // The velocity of the observer resolved along the north of the target, e.g., along the unit
  // vector (-sin δ cos α, -sin δ sin α, cos δ), which is the direction of increasing declination
  // (in SI metres per second):
  const north = -x * Math.sin(dec) * Math.cos(ra) - y * Math.sin(dec) * Math.sin(ra) + z * cosDec

  // The displacement in declination is the northward velocity as a fraction of the speed of light:
  const Δdec = north / c

  // The parallel of the target shortens as cos δ towards the poles, and where it is shorter than
  // the displacement along it the right ascension is degenerate, e.g., the displacement carries the
  // target about the pole, and so it is displaced in declination alone.
  //
  // N.B. The parallel is compared against the displacement itself, and not against a fixed
  // tolerance: a fixed tolerance bounds the declination at which the target is taken to be at a
  // pole, but not the displacement in right ascension that would be resolved just outside of it,
  // whereas this bounds that displacement to a radian:
  if (Math.abs(cosDec) <= Math.abs(east) / c) {
    return {
      ra: 0,
      dec: degrees(Δdec)
    }
  }

  // The displacement in right ascension is the eastward velocity as a fraction of the speed of
  // light, taken along the parallel of the target:
  const Δra = east / (c * cosDec)

  return {
    ra: degrees(Δra),
    dec: degrees(Δdec)
  }
}

/*****************************************************************************************************************/
