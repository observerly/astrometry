/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/Q
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { getCorrectionToEquatorialForAnnualAbberation } from './abberation'

import { getAngularSeparation } from './astrometry'

import type { EquatorialCoordinate, GeographicCoordinate, HorizontalCoordinate } from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getLunarEquatorialCoordinate, getLunarIllumination } from './moon'

import { getCorrectionToEquatorialForNutation } from './nutation'

import { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

import { getCorrectionToHorizontalForRefraction } from './refraction'

import { getSolarEquatorialCoordinate } from './sun'

import { getNormalizedAzimuthalDegree, getNormalizedInclinationDegree } from './utilities'

/*****************************************************************************************************************/

type Q = EquatorialCoordinate & {
  /**
   *
   * The Q index is a measure of the quality of the an observation, which takes into account the
   * illumination of the Moon, the altitude of the target, and the altitude of the Sun as well as
   * the angular separation between the Moon and the target.
   *
   * The Q index is a value between -1 and 1.
   *
   */
  Q: number
  /**
   *
   *
   * The Moon's illumination factor, which has a range of 0 to 100 percent.
   *
   */
  K: number
  /**
   *
   * Angular separation between the Moon and the target, which has a range of 0 to 180 degrees.
   *
   */
  φ: number
  /**
   *
   * The altitude of the target, which has a range of -90 to 90 degrees.
   *
   */
  A: number
  /**
   *
   * The altitude of the Sun, which has a range of -90 to 90 degrees.
   *
   */
  alt: number
}

/*****************************************************************************************************************/

// The Q index is a measure of the quality of the an observation, which takes into account the
// illumination of the Moon, the altitude of the target, and the altitude of the Sun as well as
// the angular separation between the Moon and the target.
export const q = (
  K: number,
  φ: number,
  A: number,
  sun: HorizontalCoordinate,
  moon: HorizontalCoordinate
): number => {
  // If either the target is below the horizon or the Sun is above the horizon, then the Q index is -1:
  if (A < 6 || sun.alt > -18) {
    return -1
  }

  // The Moon's illumination factor, which has a range of 0 to 100 percent:
  const k = 1 - 2 * (K / 100)

  // Angular separation between the Moon and the target, which has a range of 0 to 180 degrees:
  // e.g., the maximum antipodal angular separation is 180 degrees:
  const a = 2 * (φ / 180) - 1

  // Moon Q, which takes into account the Moon's illumination and the distance from
  // the Moon to the target (e.g., we can discount the Lunar illumination factor if
  // the distance is greater than 60 degrees):
  let MQ = φ >= 60 ? a : K < 25 ? a : -(a * k)

  // If the Moon is below the horizon, then the Moon Q is 1:
  if (moon.alt <= 0) {
    MQ = 1
  }

  // Target Q, which takes into account the altitude of the target:
  // We accept that a value greater than 6 degrees is a good altitude for the target:
  const TQ = A <= 6 ? A / 96 - 1 / 16 : A / 84 - 1 / 14

  // Sun Q, which takes into account the altitude of the Sun:
  // We accept that a value of less than -18 degrees is a good altitude for the Sun:
  const SQ = sun.alt <= -18 ? -sun.alt / 72 - 1 / 4 : -sun.alt / 108 - 1 / 6

  // The Q index is the average of the Moon Q, Target Q, and Sun Q, which has a range of -1 to 1:
  return (MQ + TQ + SQ) / 3
}

/*****************************************************************************************************************/

/**
 *
 * getQIndex()
 *
 * @brief The Q index is a measure of the quality of the an observation, which takes into account the
 * illumination of the Moon, the altitude of the target, and the altitude of the Sun as well as
 * the angular separation between the Moon and the target.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinates of the observer.
 * @param target - The equatorial coordinates of the target object (at J2000.0).
 * @returns The Q index of the observation, a value between -1 and 1.
 */
export function getQIndex(
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): Q {
  // Correct the target's equatorial coordinates for the precession of the equinoxes:
  const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, target)

  // Get the correction to the target's equatorial coordinates for abberation:
  const abberation = getCorrectionToEquatorialForAnnualAbberation(datetime, target)

  // Get the correction to the target's equatorial coordinates for nutation:
  const nutation = getCorrectionToEquatorialForNutation(datetime, target)

  // Get the normalized azimuthal of the target:
  const ra = getNormalizedAzimuthalDegree(target.ra + precession.ra + abberation.ra + nutation.ra)

  // Get the normalized declination of the target:
  const dec = getNormalizedInclinationDegree(
    target.dec + precession.dec + abberation.dec + nutation.dec
  )

  // Convert the target's equatorial coordinates to horizontal coordinates:
  const { alt: a, az: A } = getCorrectionToHorizontalForRefraction(
    convertEquatorialToHorizontal(datetime, observer, {
      ra,
      dec
    })
  )

  // Get the illumination fraction of the Moon:
  const K = getLunarIllumination(datetime)

  // Get the horizontal coordinate of the Sun, using the altitude of the Sun:
  const sun = getCorrectionToHorizontalForRefraction(
    convertEquatorialToHorizontal(datetime, observer, getSolarEquatorialCoordinate(datetime))
  )

  // Get the horizontal coordinate of the Moon:
  const moon = getCorrectionToHorizontalForRefraction(
    convertEquatorialToHorizontal(datetime, observer, getLunarEquatorialCoordinate(datetime))
  )

  const φ = getAngularSeparation(
    {
      θ: moon.az,
      φ: moon.alt
    },
    {
      θ: A,
      φ: a
    }
  )

  // Calculate the Q index, and return the parameters of the observation:
  return {
    ra,
    dec,
    Q: q(K, φ, a, sun, moon),
    K,
    φ,
    A,
    alt: sun.alt
  }
}

/*****************************************************************************************************************/
