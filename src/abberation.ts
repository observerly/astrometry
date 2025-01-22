/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/abberation
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getObliquityOfTheEcliptic } from './astrometry'

import type { EquatorialCoordinate } from './common'

import { getEccentricityOfOrbit } from './earth'

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
 * getCorrectionToEquatorialForAnnualAbberation()
 *
 * Corrects the equatorial coordinate of a target for abberation in
 * longitude and obliquity due to the apparent motion of the Earth.
 *
 * @param date - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The corrected equatorial coordinate of the target.
 *
 */
export const getCorrectionToEquatorialForAnnualAbberation = (
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

  // Get the constant of abberation (in degrees):
  const κ = radians(20.49552 / 3600)

  // Get the eccentricity of the Earth's orbit (dimensionless):
  const e = getEccentricityOfOrbit(datetime)

  // Get the longitude of perihelion (in degrees):
  const ϖ = radians(102.93735 + 1.71953 * T + 0.00046 * T ** 2)

  // Get the true geometric longitude of the sun (in degrees):
  const S = radians(getSolarTrueGeometricLongitude(datetime))

  // Calculate the abberation correction in right ascension (in degrees):
  const Δra =
    -κ * (Math.cos(ra) * Math.cos(S) * Math.cos(ε) + (Math.sin(ra) * Math.sin(S)) / Math.cos(dec)) +
    e *
      κ *
      (Math.cos(ra) * Math.cos(ϖ) * Math.cos(ε) + (Math.sin(ra) * Math.sin(ϖ)) / Math.cos(dec))

  // Calculate the abberation correction in declination (in degrees):
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
