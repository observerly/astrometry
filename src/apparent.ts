/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/apparent
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import {
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForVelocityAberration
} from './aberration'

import {
  getCorrectionToEquatorialForProperMotion,
  getNormalisedSphericalCoordinate
} from './astrometry'

import type { CartesianCoordinate, EquatorialCoordinate, EquatorialProperMotion } from './common'

import { getCorrectionToEquatorialForAnnualParallax } from './parallax'

/*****************************************************************************************************************/

/**
 *
 * getApparentEquatorialCoordinate()
 *
 * Resolves the apparent equatorial coordinate of a target for an observer at the given datetime,
 * e.g., the coordinate the observer points at, which is the coordinate of the catalogue displaced
 * by the proper motion of the target, by its annual parallax, by the annual aberration of the
 * motion of the Earth about the Sun, and, for an observer in motion about the Earth, e.g., a
 * spacecraft in its orbit, by the aberration of that velocity.
 *
 * The corrections displace the target within the axes of the catalogue, e.g., the frame of the
 * coordinate is not precessed nor nutated to the equator and equinox of the date, which is the
 * frame an observer that points by a star tracker points in.
 *
 * N.B. The velocity is the whole of the geocentric motion of the observer, and so it carries the
 * diurnal aberration with it: an observer at the surface of the Earth is carried by its rotation,
 * and the diurnal aberration is the aberration of that velocity, e.g., of
 * getGeocentricRotationalVelocity(). It is therefore not added separately, which would resolve
 * the rotation twice for an observer whose velocity already carries it.
 *
 * @param datetime - The date and time of the observation.
 * @param target - The equatorial coordinate of the target, of a given parallax (in arcseconds).
 * @param properMotion - The proper motion of the target (in arcseconds per Julian year).
 * @param velocity - The geocentric equatorial velocity of the observer (in SI metres per second).
 * @returns The apparent equatorial coordinate of the target (in degrees).
 *
 */
export const getApparentEquatorialCoordinate = (
  datetime: Date,
  target: EquatorialCoordinate,
  properMotion?: EquatorialProperMotion,
  velocity?: CartesianCoordinate
): EquatorialCoordinate => {
  // The proper motion of the target carries it from the epoch of the catalogue to the datetime of
  // the observation, and so it is applied first, and the displacements of the observer are then
  // resolved about the target as it lies at the datetime:
  const motion = properMotion
    ? getCorrectionToEquatorialForProperMotion(datetime, target, properMotion)
    : { ra: 0, dec: 0 }

  // Normalise the moved coordinate as a pair, e.g., a declination that is carried over a pole is
  // reflected back over it, and its right ascension is rotated to the antipodal meridian. The
  // parallax of the target is carried with it:
  const { θ, φ } = getNormalisedSphericalCoordinate({
    θ: target.dec + motion.dec,
    φ: target.ra + motion.ra
  })

  const moved = { ...target, ra: φ, dec: θ }

  // The displacement of the target by the motion of the observer about the Sun over the year:
  const parallax = getCorrectionToEquatorialForAnnualParallax(datetime, moved)

  // The aberration of the velocity of the Earth about the Sun, which every observer of the Earth
  // shares, whether at its surface or in orbit about it:
  const annual = getCorrectionToEquatorialForAnnualAberration(datetime, moved)

  // The aberration of the velocity of the observer about the Earth, e.g., a spacecraft in its
  // orbit, which is over and above the velocity of the Earth the annual aberration resolves. An
  // observer that gives no velocity is taken to be at rest about the Earth, and one that gives no
  // z component to it is taken to travel in the plane of the equator:
  const orbital = velocity
    ? getCorrectionToEquatorialForVelocityAberration(moved, { ...velocity, z: velocity.z ?? 0 })
    : { ra: 0, dec: 0 }

  // The displacements are each a few arcseconds at their greatest, and so they are resolved about
  // the one coordinate and summed, e.g., the cross terms between them are below a microarcsecond:
  const apparent = getNormalisedSphericalCoordinate({
    θ: moved.dec + parallax.dec + annual.dec + orbital.dec,
    φ: moved.ra + parallax.ra + annual.ra + orbital.ra
  })

  return {
    ra: apparent.φ,
    dec: apparent.θ
  }
}

/*****************************************************************************************************************/
