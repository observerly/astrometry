/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/propermotion
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getNumberOfCenturiesSinceJ2000 } from './epoch'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForProperMotion()
 *
 * Corrects the equatorial coordinate of a target for the proper motion of the target, e.g., the
 * apparent motion of the target across the celestial sphere, relative to the barycenter of the
 * solar system, over the interval between the epoch of the coordinate and the datetime given.
 *
 * N.B. The proper motion in right ascension is the great-circle rate, as published, and so it is
 * divided through by the cosine of the declination to obtain the rate of change of the right
 * ascension itself.
 *
 * N.B. The motion is treated as linear over the interval, which is accurate for the intervals of
 * decades that separate the epoch of a catalogue from the present day. A rigorous treatment
 * resolves the space motion of the target, for which its parallax and its radial velocity are
 * also required.
 *
 * @param datetime - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @param properMotion - The proper motion of the target (in arcseconds per Julian year).
 * @returns The correction to the equatorial coordinate of the target (in degrees).
 *
 */
export const getCorrectionToEquatorialForProperMotion = (
  datetime: Date,
  target: EquatorialCoordinate,
  properMotion: EquatorialCoordinate
): EquatorialCoordinate => {
  // Get the number of Julian years since the J2000.0 epoch of the coordinate:
  const t = getNumberOfCenturiesSinceJ2000(datetime) * 100

  // The proper motion in declination is the rate of change of the declination itself, converted
  // from arcseconds to degrees:
  const Δdec = (properMotion.dec * t) / 3600

  // The right ascension of a target at either celestial pole is degenerate, and its proper motion
  // in right ascension is therefore not resolvable. N.B. The cosine of the declination is tested
  // for through the declination itself, as the cosine of ±90° is not exactly zero:
  if (Math.abs(target.dec) >= 90) {
    return {
      ra: 0,
      dec: Δdec
    }
  }

  // The proper motion in right ascension is the great-circle rate, and so it is divided through by
  // the cosine of the declination to obtain the rate of change of the right ascension itself:
  const Δra = (properMotion.ra * t) / Math.cos(radians(target.dec)) / 3600

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/
