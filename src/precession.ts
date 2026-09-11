/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate, getTerrestrialTime } from './epoch'

import {
  convertRadiansToDegrees as degrees,
  convertDegreesToRadians as radians,
  getNormalizedAzimuthalDegree
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForFrameBias()
 *
 * Corrects the equatorial coordinates of a target for the frame bias, e.g., the fixed rotation
 * between the International Celestial Reference System (ICRS), which a modern catalogue coordinate
 * is referred to, and the mean equator and equinox of J2000.0, which the precession of the
 * equinoxes is referred from. The correction terms should be added to the target's coordinate by
 * the caller, before the correction for the precession of the equinoxes is resolved.
 *
 * @param target - The equatorial ICRS coordinates of the target.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForFrameBias = (
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // The frame bias of IAU 2000, e.g., the offset of the ICRS right ascension origin from the mean equinox of
  // J2000.0 (in radians):
  const δra = radians(-0.0146 / 3600)

  // The frame bias in longitude, e.g., the offset of the ICRS pole from the mean pole of J2000.0 in the direction
  // of the mean equinox of J2000.0 (in radians):
  const δψ = radians(-0.041775 / 3600)

  // The frame bias in obliquity, e.g., the offset of the ICRS pole from the mean pole of J2000.0 at right angles
  // to the mean equinox of J2000.0 (in radians):
  const δε = radians(-0.0068192 / 3600)

  // The mean obliquity of the ecliptic at J2000.0 of IAU 1980, which the frame bias in longitude is referred to
  // (in radians):
  const ε0 = radians(84381.448 / 3600)

  // The unit vector of the target in the ICRS:
  const v = {
    x: Math.cos(dec) * Math.cos(ra),
    y: Math.cos(dec) * Math.sin(ra),
    z: Math.sin(dec)
  }

  // Rotate the unit vector about the z axis by the bias of the right ascension origin:
  const r = {
    x: Math.cos(δra) * v.x + Math.sin(δra) * v.y,
    y: -Math.sin(δra) * v.x + Math.cos(δra) * v.y,
    z: v.z
  }

  // Rotate the unit vector about the y axis by the bias in longitude, projected onto the equator:
  const q = {
    x: Math.cos(δψ * Math.sin(ε0)) * r.x - Math.sin(δψ * Math.sin(ε0)) * r.z,
    y: r.y,
    z: Math.sin(δψ * Math.sin(ε0)) * r.x + Math.cos(δψ * Math.sin(ε0)) * r.z
  }

  // Rotate the unit vector about the x axis by the bias in obliquity, e.g., the unit vector of the target referred
  // to the mean equator and equinox of J2000.0:
  const mean = {
    x: q.x,
    y: Math.cos(-δε) * q.y + Math.sin(-δε) * q.z,
    z: -Math.sin(-δε) * q.y + Math.cos(-δε) * q.z
  }

  // Recover the coordinate from the unit vector, e.g., as a rotated vector, and not expanded about the target,
  // which would divide by cos δ and so degrade towards the celestial poles:
  return {
    ra: getNormalizedAzimuthalDegree(degrees(Math.atan2(mean.y, mean.x)) - target.ra + 180) - 180,
    dec: degrees(Math.atan2(mean.z, Math.hypot(mean.x, mean.y))) - target.dec
  }
}

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
