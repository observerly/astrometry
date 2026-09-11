/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate, getTerrestrialTime } from './epoch'

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
  // The precession angles are referred to Terrestrial Time, and so they are resolved at the Terrestrial Time of
  // the given date:
  const JD = getJulianDate(getTerrestrialTime(datetime))

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Calculate the precession angle ζ of the equatorial precession of IAU 2006 (in degrees):
  const ζ =
    (2.650545 +
      2306.083227 * T +
      0.2988499 * T ** 2 +
      0.01801828 * T ** 3 -
      0.000005971 * T ** 4 -
      0.0000003173 * T ** 5) /
    3600

  // Calculate the precession angle z of the equatorial precession of IAU 2006 (in degrees):
  const z =
    (-2.650545 +
      2306.077181 * T +
      1.0927348 * T ** 2 +
      0.01826837 * T ** 3 -
      0.000028596 * T ** 4 -
      0.0000002904 * T ** 5) /
    3600

  // Calculate the precession angle θ of the equatorial precession of IAU 2006 (in degrees):
  const θ =
    (2004.191903 * T -
      0.4294934 * T ** 2 -
      0.04182264 * T ** 3 -
      0.000007089 * T ** 4 -
      0.0000001274 * T ** 5) /
    3600

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

  // Normalise the right ascension difference into (-180°, 180°] to avoid a
  // ±360° branch-cut jump from atan2 when the target lies near RA 0°/360°:
  const dra = ra - target.ra

  return {
    ra: dra - 360 * Math.round(dra / 360),
    dec: dec - target.dec
  }
}

/*****************************************************************************************************************/
