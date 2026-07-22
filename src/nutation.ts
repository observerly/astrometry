/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nutation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getObliquityOfTheEcliptic } from './astrometry'

import type { EquatorialCoordinate } from './common'

import {
  getLunarMeanGeometricLongitude,
  getLunarMeanEclipticLongitudeOfTheAscendingNode
} from './moon'

import { getSolarMeanGeometricLongitude } from './sun'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getNutation()
 *
 * The nutation of the Earth is the periodic oscillation of the Earth's axis of
 * rotation about its mean position, caused by the gravitational influence of
 * the Moon and Sun on the Earth's equatorial bulge.
 *
 * @param date - The date for which to calculate the nutation.
 * @returns The nutation in longitude (Δψ) and obliquity (Δε), both in degrees.
 *
 */
export const getNutation = (date: Date): { Δψ: number; Δε: number } => {
  // Get the ecliptic longitude of the ascending node of the Moon (in degrees):
  const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(date)

  // Get the mean geometric longitude of the sun (in degrees):
  const L = getSolarMeanGeometricLongitude(date)

  // Get the mean geometric longitude of the moon (in degrees):
  const l = getLunarMeanGeometricLongitude(date)

  // Get the nutation in longitude (in arcseconds):
  const Δψ =
    -17.2 * Math.sin(radians(Ω)) -
    1.32 * Math.sin(2 * radians(L)) -
    0.23 * Math.sin(2 * radians(l)) +
    0.21 * Math.sin(2 * radians(Ω))

  // Get the nutation in obliquity (in arcseconds):
  const Δε =
    9.2 * Math.cos(radians(Ω)) +
    0.57 * Math.cos(2 * radians(L)) +
    0.1 * Math.cos(2 * radians(l)) -
    0.09 * Math.cos(2 * radians(Ω))

  // Return the nutation in longitude and obliquity (in degrees):
  return {
    Δψ: Δψ / 3600,
    Δε: Δε / 3600
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForNutation()
 *
 * Calculates the correction terms (Δra, Δdec) to the equatorial coordinate of a target for
 * nutation in longitude and obliquity due to the gravitational influence of the moon and sun
 * on the Earth, causing the Earth's axial precession to vary over time. The correction terms
 * should be added to the target's coordinate by the caller.
 *
 * @param datetime - The date to calculate the equatorial correction for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForNutation = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // Get the nutation in longitude and obliquity (in degrees):
  const { Δψ, Δε } = getNutation(datetime)

  // Get the true obliquity of the ecliptic (in degrees):
  const ε = radians(getObliquityOfTheEcliptic(datetime) + Δε)

  // Calculate the nutation correction in right ascension (in degrees)
  const Δra =
    (Math.cos(ε) + Math.sin(ε) * Math.sin(ra) * Math.tan(dec)) * Δψ -
    Math.cos(ra) * Math.tan(dec) * Δε

  // Calculate the nutation correction in declination (in degrees)
  const Δdec = Math.sin(ε) * Math.cos(ra) * Δψ + Math.sin(ra) * Δε

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/
