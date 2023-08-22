/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nutation
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getObliquityOfTheEcliptic } from './astrometry'

import { type EquatorialCoordinate } from './common'

import {
  getLunarMeanGeometricLongitude,
  getLunarMeanEclipticLongitudeOfTheAscendingNode
} from './moon'

import { getSolarMeanGeometricLongitude } from './sun'

import { convertDegreesToRadians as radians, convertRadiansToDegrees as degrees } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForNutation()
 *
 * Corrects the equatorial coordinate of a target for nutation in longitude and obliquity due to the
 * gravitational influence of the moon and sun on the Earth, causing the Earth's axial precession
 * to vary over time.
 *
 * @param date - The date to correct the equatorial coordinate for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The corrected equatorial coordinate of the target.
 *
 */
export const getCorrectionToEquatorialForNutation = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // Get the ecliptic longitude of the ascending node of the mode (in degrees):
  const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the mean geometric longitude of the sun (in degrees):
  const L = getSolarMeanGeometricLongitude(datetime)

  // Get the mean geometric longitude of the moon (in degrees):
  const l = getLunarMeanGeometricLongitude(datetime)

  // Get the nutation in longitude (in arcseconds)
  const Δψ =
    -17.2 * Math.sin(radians(Ω)) -
    1.32 * Math.sin(radians(2 * L)) -
    0.23 * Math.sin(radians(2 * l)) +
    0.21 * Math.sin(radians(2 * Ω))

  // Get the nutation in obliquity (in arcseconds)
  const Δε =
    9.2 * Math.cos(radians(Ω)) +
    0.57 * Math.cos(radians(2 * L)) +
    0.1 * Math.cos(radians(2 * l)) -
    0.09 * Math.cos(radians(2 * Ω))

  // Get the true obliquity of the ecliptic (in degrees):
  const ε = radians(getObliquityOfTheEcliptic(datetime) + Δε / 3600)

  // Calculate the nutation correction in right ascension (in degrees)
  const Δra =
    (degrees(Math.cos(ε) + Math.sin(ε) * Math.sin(ra) * Math.tan(dec)) * Δψ) / 3600 -
    (degrees(Math.cos(ra) * Math.tan(dec)) * Δε) / 3600

  // Calculate the nutation correction in declination (in degrees)
  const Δdec =
    (degrees(Math.sin(ε) * Math.cos(ra)) * Δψ) / 3600 + (degrees(Math.sin(ra)) * Δε) / 3600

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/
