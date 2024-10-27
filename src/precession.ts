/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate } from './epoch'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForPrecessionOfEquinoxes()
 *
 * Corrects the equatorial coordinates of a target for the precession of the equinoxes.
 *
 * @param date - The date to correct the equatorial coordinates for.
 * @param target - The equatorial J2000 coordinates of the target.
 * @returns The corrected equatorial coordinates of the target.
 *
 */
export const getCorrectionToEquatorialForPrecessionOfEquinoxes = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Calculate the precession angle ζ (in degrees):
  const ζ = (2306.2181 * T + 0.30188 * T ** 2 + 0.017998 * T ** 3) / 3600

  // Calculate the precession angle z (in degrees):
  const z = (2306.2181 * T + 1.09468 * T ** 2 + 0.018203 * T ** 3) / 3600

  // Calculate the precession angle θ (in degrees):
  const θ = (2004.3109 * T - 0.42665 * T ** 2 - 0.041833 * T ** 3) / 3600

  // Calculate the reduction coordinates of the target:
  const A = Math.cos(radians(target.dec)) * Math.sin(radians(target.ra + ζ))

  const B =
    Math.cos(radians(θ)) * Math.cos(radians(target.dec)) * Math.cos(radians(target.ra + ζ)) -
    Math.sin(radians(θ)) * Math.sin(radians(target.dec))

  const C =
    Math.sin(radians(θ)) * Math.cos(radians(target.dec)) * Math.cos(radians(target.ra + ζ)) +
    Math.cos(radians(θ)) * Math.sin(radians(target.dec))

  // Calculate the equatorial coordinates of the target:
  const ra = degrees(Math.atan2(A, B)) + z

  const dec = degrees(Math.asin(C))

  return {
    ra: ra - target.ra,
    dec: dec - target.dec
  }
}

/*****************************************************************************************************************/
