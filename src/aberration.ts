/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getHourAngle } from './astrometry'

import type { CartesianCoordinate, EquatorialCoordinate, GeographicCoordinate } from './common'

import { AU_IN_METERS, EARTH_ANGULAR_VELOCITY, EARTH_RADIUS, c } from './constants'

import { getEccentricityOfOrbit } from './earth'

import { getTrueObliquityOfTheEcliptic } from './ecliptic'

import { getJulianDate } from './epoch'

import { getNutation } from './nutation'

import { getSolarGeometricEclipticCoordinate, getSolarTrueGeometricLongitude } from './sun'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

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

  // Get the true obliquity of the ecliptic (in radians):
  const ε = radians(getTrueObliquityOfTheEcliptic(datetime))

  // Get the constant of aberration (in degrees):
  const κ = radians(20.49552 / 3600)

  // Get the eccentricity of the Earth's orbit (dimensionless):
  const e = getEccentricityOfOrbit(datetime)

  // Get the longitude of perihelion (in degrees):
  const ϖ = radians(102.93735 + 1.71953 * T + 0.00046 * T ** 2)

  // Get the true geometric longitude of the sun (in degrees):
  const S = radians(getSolarTrueGeometricLongitude(datetime))

  // The velocity of the Earth as a fraction of the speed of light, in the plane of the ecliptic, rotated about the
  // obliquity of the ecliptic into the equatorial frame:
  const v = {
    x: κ * (Math.sin(S) - e * Math.sin(ϖ)),
    y: -κ * (Math.cos(S) - e * Math.cos(ϖ)) * Math.cos(ε),
    z: -κ * (Math.cos(S) - e * Math.cos(ϖ)) * Math.sin(ε)
  }

  // The unit vector of the target, displaced by the velocity of the Earth, e.g., the apparent direction of the
  // target, which is resolved as a displaced vector, and not expanded about the target, which would divide by
  // cos δ and so degrade towards the celestial poles:
  const apparent = {
    x: Math.cos(dec) * Math.cos(ra) + v.x,
    y: Math.cos(dec) * Math.sin(ra) + v.y,
    z: Math.sin(dec) + v.z
  }

  return {
    ra:
      getNormalizedAzimuthalDegree(degrees(Math.atan2(apparent.y, apparent.x)) - target.ra + 180) -
      180,
    dec: degrees(Math.atan2(apparent.z, Math.hypot(apparent.x, apparent.y))) - target.dec
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

  // Calculate the observer's tangential velocity at the equator due to Earth's rotation (in m/s):
  const v = radians(EARTH_ANGULAR_VELOCITY) * EARTH_RADIUS

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
 * The correction is the first order aberration of the direction to the target, e.g., the unit
 * vector of the target displaced by v/c, and so it is the same physics as the diurnal aberration
 * of an observer carried by the rotation of the Earth, for a velocity that is not constrained to
 * that rotation. An observer in a low Earth orbit travels at ~7.7 km/s, and so the displacement
 * reaches ~5.3 arcseconds, against the ~0.32 arcseconds of an observer at the equator.
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
  // the celestial sphere:
  const cosDec = Math.cos(dec)

  // The unit vector of the target, in the equatorial frame:
  const n = {
    x: cosDec * Math.cos(ra),
    y: cosDec * Math.sin(ra),
    z: Math.sin(dec)
  }

  // The vector to the apparent direction of the target, e.g., the unit vector of the target
  // displaced by the velocity of the observer as a fraction of the speed of light. Only its
  // direction is wanted, and so it is left unnormalised:
  const apparent = {
    x: n.x + x / c,
    y: n.y + y / c,
    z: n.z + z / c
  }

  // The coordinate is recovered from the displaced vector, and is not expanded about the target,
  // which would divide by cos δ and so be unbounded at the poles.
  //
  // N.B. The declination is taken against the distance from the axis of rotation, and not as the
  // arc sine of the polar component, which is ill-conditioned towards the poles:
  const Δdec = degrees(Math.atan2(apparent.z, Math.hypot(apparent.x, apparent.y))) - target.dec

  // The displacement in right ascension, taken the shorter of the two ways about the sphere:
  const Δra =
    getNormalizedAzimuthalDegree(degrees(Math.atan2(apparent.y, apparent.x)) - target.ra + 180) -
    180

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForLightDeflection()
 *
 * Corrects the equatorial coordinate of a target for the gravitational deflection of light by the
 * Sun, e.g., the bending of the light of the target towards the Sun as it passes through the
 * gravitational field of the Sun, which displaces the apparent place of the target away from the
 * Sun. The correction terms should be added to the target's coordinate by the caller.
 *
 * The deflection is that of the first post-Newtonian order of the Schwarzschild metric, e.g., up to
 * ~1.75 arcseconds at the limb of the Sun, and ~4 milliarcseconds at right angles to the Sun.
 *
 * N.B. The deflection is unbounded for a target behind the Sun, and so the distance of the target
 * from the direction of the Sun is held to a small floor, as the reference implementation of the
 * IAU Standards of Fundamental Astronomy (SOFA) holds it.
 *
 * @param datetime - The date to correct the equatorial coordinate for.
 * @param target - The equatorial coordinate of the target, referred to the true equator and equinox of the date.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForLightDeflection = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // The Schwarzschild radius of the Sun, e.g., 2GM☉/c² for the heliocentric gravitational constant of the IAU 2009
  // system of astronomical constants (in astronomical units):
  const SRS = 1.97412574336e-8

  // Get the geometric ecliptic coordinate of the Sun, e.g., the direction of the Sun from the Earth before the
  // corrections for the nutation and for the aberration of light, as the deflection is a function of the geometry
  // of the Sun, the Earth and the target, and not of the apparent place of the Sun:
  const sun = getSolarGeometricEclipticCoordinate(datetime)

  // Get the nutation in longitude (in degrees):
  const { Δψ } = getNutation(datetime)

  // The geometric longitude of the Sun, referred to the true equinox of the date by the nutation in longitude, so
  // that the direction of the Sun is referred to the true equator and equinox of the date, as the target is (in
  // radians):
  const λ = radians(sun.λ + Δψ)

  const β = radians(sun.β)

  // Get the true obliquity of the ecliptic (in radians):
  const ε = radians(getTrueObliquityOfTheEcliptic(datetime))

  // Get the distance of the Sun from the Earth (in astronomical units):
  const d = sun.R / AU_IN_METERS

  // The unit vector of the target:
  const p = {
    x: Math.cos(dec) * Math.cos(ra),
    y: Math.cos(dec) * Math.sin(ra),
    z: Math.sin(dec)
  }

  // The unit vector from the Sun to the Earth, e.g., the direction of the Sun from the Earth reversed, rotated
  // about the obliquity of the ecliptic from the ecliptic frame into the equatorial frame:
  const e = {
    x: -Math.cos(β) * Math.cos(λ),
    y: -(Math.cos(β) * Math.sin(λ) * Math.cos(ε) - Math.sin(β) * Math.sin(ε)),
    z: -(Math.cos(β) * Math.sin(λ) * Math.sin(ε) + Math.sin(β) * Math.cos(ε))
  }

  // The cosine of the angle between the target and the direction from the Sun to the Earth, e.g., the cosine of
  // the supplement of the elongation of the target from the Sun:
  const cosine = p.x * e.x + p.y * e.y + p.z * e.z

  // The magnitude of the deflection, e.g., the Schwarzschild radius of the Sun over the distance of the Sun,
  // divided by 1 + cos θ, held to a small floor for a target behind the Sun (in radians):
  const w = SRS / d / Math.max(1 + cosine, 1e-6)

  // The unit vector of the target, displaced away from the Sun by the deflection, e.g., along the component of
  // the direction from the Sun to the Earth at right angles to the target:
  const apparent = {
    x: p.x + w * (e.x - cosine * p.x),
    y: p.y + w * (e.y - cosine * p.y),
    z: p.z + w * (e.z - cosine * p.z)
  }

  // The coordinate is recovered from the displaced vector, and is not expanded about the target, which would
  // divide by cos δ and so be unbounded at the poles:
  return {
    ra:
      getNormalizedAzimuthalDegree(degrees(Math.atan2(apparent.y, apparent.x)) - target.ra + 180) -
      180,
    dec: degrees(Math.atan2(apparent.z, Math.hypot(apparent.x, apparent.y))) - target.dec
  }
}

/*****************************************************************************************************************/
