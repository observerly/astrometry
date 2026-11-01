/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getHourAngle } from './astrometry'

import type { CartesianCoordinate, EquatorialCoordinate, GeographicCoordinate } from './common'

import { AU_IN_METERS, c, EARTH_ANGULAR_VELOCITY, EARTH_RADIUS } from './constants'

import { convertCartesianToEquatorial, convertEquatorialToCartesian } from './coordinates'

import { getBarycentricSolarVector, getGeometricSolarVector } from './sun'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getBarycentricEarthVelocity()
 *
 * The velocity of the centre of the Earth about the barycentre of the Solar System, referred to the mean equator
 * and equinox of J2000.0, e.g., the velocity of the Earth about the Sun of the VSOP87 theory, which carries the
 * motion of the Earth about the barycentre of the Earth and the Moon, together with the velocity of the Sun about
 * the barycentre of the Solar System, as eraEpv00 resolves the barycentric velocity of the Earth.
 *
 * The velocities are resolved as the central differences of the positions over a day, e.g., the truncation of the
 * difference is ~0.2 % of the monthly motion of the Earth about the barycentre of the Earth and the Moon, which is
 * ~12.5 metres per second, and so is ~0.02 metres per second, or ~0.02 milliarcseconds of aberration.
 *
 * @param datetime - The date to resolve the velocity of the Earth for.
 * @returns The barycentric velocity of the Earth (in astronomical units per day).
 *
 */
export const getBarycentricEarthVelocity = (datetime: Date): Required<CartesianCoordinate> => {
  // The half interval of the central difference (in milliseconds), e.g., half of a day:
  const h = 43200000

  const before = new Date(datetime.getTime() - h)

  const after = new Date(datetime.getTime() + h)

  // The heliocentric position of the Earth is the geocentric position of the Sun reversed, and so the
  // heliocentric velocity of the Earth is the rate of the geocentric position of the Sun reversed:
  const s0 = getGeometricSolarVector(before)

  const s1 = getGeometricSolarVector(after)

  // The barycentric position of the Sun at either end of the interval:
  const b0 = getBarycentricSolarVector(before)

  const b1 = getBarycentricSolarVector(after)

  // The barycentric velocity of the Earth, e.g., its heliocentric velocity and the barycentric velocity of the
  // Sun, over the one day of the interval (in astronomical units per day):
  return {
    x: -(s1.x - s0.x) + (b1.x - b0.x),
    y: -(s1.y - s0.y) + (b1.y - b0.y),
    z: -(s1.z - s0.z) + (b1.z - b0.z)
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForAnnualAberration()
 *
 * Corrects the equatorial coordinate of a target for the annual aberration of light, e.g., the displacement of the
 * target towards the direction of the motion of the Earth about the barycentre of the Solar System, of up to ~20.5
 * arcseconds. The correction terms should be added to the target's coordinate by the caller.
 *
 * The aberration is that of the special relativistic composition of the velocity of the Earth with the direction
 * of the target, to the second order in the velocity, together with the term of the gravitational potential of
 * the Sun at the Earth, as eraAb of the IAU Standards of Fundamental Astronomy (SOFA) resolves it.
 *
 * N.B. The aberration is resolved within the mean equator and equinox of J2000.0, as eraAtciq resolves it within
 * the BCRS, and so it is applied to the J2000 coordinate before the precession and the nutation.
 *
 * @param datetime - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForAnnualAberration = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  // The Schwarzschild radius of the Sun, e.g., 2GM☉/c² for the TDB-compatible heliocentric gravitational constant
  // of the IAU 2009 system of astronomical constants (in astronomical units):
  const SRS = 1.97412574336e-8

  // The barycentric velocity of the Earth (in astronomical units per day):
  const velocity = getBarycentricEarthVelocity(datetime)

  // The barycentric velocity of the Earth as a fraction of the speed of light:
  const k = AU_IN_METERS / 86400 / c

  const v = { x: velocity.x * k, y: velocity.y * k, z: velocity.z * k }

  // The reciprocal of the Lorentz factor of the velocity of the Earth, e.g., √(1 − v²):
  const bm1 = Math.sqrt(1 - (v.x ** 2 + v.y ** 2 + v.z ** 2))

  // The distance of the Sun from the Earth (in astronomical units):
  const s = getGeometricSolarVector(datetime)

  const d = Math.hypot(s.x, s.y, s.z)

  // The unit vector of the target:
  const p = convertEquatorialToCartesian(target)

  // The component of the velocity of the Earth along the direction of the target:
  const pdv = p.x * v.x + p.y * v.y + p.z * v.z

  const w1 = 1 + pdv / (1 + bm1)

  const w2 = SRS / d

  // The unit vector of the target, displaced by the velocity of the Earth, e.g., the apparent direction of the
  // target, which is resolved as a displaced vector, and not expanded about the target, which would divide by
  // cos δ and so degrade towards the celestial poles:
  const apparent = {
    x: p.x * bm1 + w1 * v.x + w2 * (v.x - pdv * p.x),
    y: p.y * bm1 + w1 * v.y + w2 * (v.y - pdv * p.y),
    z: p.z * bm1 + w1 * v.z + w2 * (v.z - pdv * p.z)
  }

  const { ra, dec } = convertCartesianToEquatorial(apparent)

  // The displacement in right ascension, taken the shorter of the two ways about the sphere:
  return {
    ra: getNormalizedAzimuthalDegree(ra - target.ra + 180) - 180,
    dec: dec - target.dec
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
 * from the direction of the Sun is held to a small floor of 10⁻⁶ / max(d², 1), where d is the
 * distance of the Sun in astronomical units, as eraLdsun of the IAU Standards of Fundamental
 * Astronomy (SOFA) holds it.
 *
 * @param datetime - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForLightDeflection = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  // The Schwarzschild radius of the Sun, e.g., 2GM☉/c² for the TDB-compatible heliocentric gravitational constant
  // of the IAU 2009 system of astronomical constants (in astronomical units):
  const SRS = 1.97412574336e-8

  // Get the geometric position of the Sun from the Earth, referred to the mean equator and equinox of J2000.0,
  // e.g., before the corrections for the nutation and for the aberration of light, as the deflection is a function
  // of the geometry of the Sun, the Earth and the target, and not of the apparent place of the Sun:
  const sun = getGeometricSolarVector(datetime)

  // Get the distance of the Sun from the Earth (in astronomical units):
  const d = Math.hypot(sun.x, sun.y, sun.z)

  const equatorial = { x: sun.x / d, y: sun.y / d, z: sun.z / d }

  // The unit vector of the target:
  const p = convertEquatorialToCartesian(target)

  // The unit vector from the Sun to the Earth, e.g., the direction of the Sun from the Earth reversed:
  const e = {
    x: -equatorial.x,
    y: -equatorial.y,
    z: -equatorial.z
  }

  // The cosine of the angle between the target and the direction from the Sun to the Earth, e.g., the cosine of
  // the supplement of the elongation of the target from the Sun:
  const cosine = p.x * e.x + p.y * e.y + p.z * e.z

  // The magnitude of the deflection, e.g., the Schwarzschild radius of the Sun over the distance of the Sun,
  // divided by 1 + cos θ, held to the floor of 10⁻⁶ / max(d², 1) for a target behind the Sun, as eraLdsun holds
  // it (in radians):
  const w = SRS / d / Math.max(1 + cosine, 1e-6 / Math.max(d * d, 1))

  // The unit vector of the target, displaced away from the Sun by the deflection, e.g., along the component of
  // the direction from the Sun to the Earth at right angles to the target:
  const apparent = {
    x: p.x + w * (e.x - cosine * p.x),
    y: p.y + w * (e.y - cosine * p.y),
    z: p.z + w * (e.z - cosine * p.z)
  }

  // The coordinate is recovered from the displaced vector, and is not expanded about the target, which would
  // divide by cos δ and so be unbounded at the poles:
  const { ra, dec } = convertCartesianToEquatorial(apparent)

  // The displacement in right ascension, taken the shorter of the two ways about the sphere:
  return {
    ra: getNormalizedAzimuthalDegree(ra - target.ra + 180) - 180,
    dec: dec - target.dec
  }
}

/*****************************************************************************************************************/
