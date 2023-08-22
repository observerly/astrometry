/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getJulianDate } from './epoch'

import { getSolarMeanAnomaly, getSolarEclipticLongitude } from './sun'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

export const getLunarAnnualEquationCorrection = (datetime: Date): number => {
  // Correct for the Sun's mean anomaly:
  const M = radians(getSolarMeanAnomaly(datetime))

  // Get the annual equation correction:
  return 0.1858 * Math.sin(M)
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanAnomaly()
 *
 * The Moon's mean anomaly is the angle between perigee and the Moon's current position.
 *
 * @param date - The date to calculate the Moon's mean anomaly for.
 * @returns The Moon's mean anomaly at the given date.
 *
 */
export const getLunarMeanAnomaly = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the Moon's mean anomaly at the current epoch relative to J2000:
  let M =
    (134.9634114 +
      477198.8676313 * T +
      0.008997 * Math.pow(T, 2) +
      Math.pow(T, 3) / 69699 -
      Math.pow(T, 4) / 14712000) %
    360

  // Correct for negative angles
  if (M < 0) {
    M += 360
  }

  return M
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanGeometricLongitude()
 *
 * The Moon's mean geometric longitude is the angle between the Moon's current
 * position and the vernal equinox.
 *
 * @param date - The date to calculate the Moon's mean geometric longitude for.
 * @returns The Moon's mean geometric longitude at the given date.
 *
 */
export const getLunarMeanGeometricLongitude = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  let l =
    (218.3164477 +
      481267.88123421 * T -
      0.0015786 * Math.pow(T, 2) +
      Math.pow(T, 3) / 538841 -
      Math.pow(T, 4) / 65194000) %
    360

  // Correct for negative angles
  if (l < 0) {
    l += 360
  }

  return l
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanEclipticLongitude()
 *
 * The mean lunar ecliptic longitude is the ecliptic longitude of the Moon
 * if the Moon's orbit where free of perturbations
 *
 * @param date - The date to calculate the Moon's mean ecliptic longitude for.
 * @returns The Moon's mean ecliptic longitude at the given date.
 *
 */
export const getLunarMeanEclipticLongitude = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the number of days since the standard epoch J2000:
  const De = JD - 2451545.0

  // Get the uncorrected mean eclptic longitude:
  let λ = (13.176339686 * De + 218.31643388) % 360

  // Correct for negative angles
  if (λ < 0) {
    λ += 360
  }

  return λ
}

/*****************************************************************************************************************/

export const getLunarEvectionCorrection = (datetime: Date): number => {
  // Get the Moon's mean anomaly at the current epoch relative to J2000:
  const M = radians(getLunarMeanAnomaly(datetime))

  // Get the Moon's mean ecliptic longitude:
  const λ = radians(getLunarMeanEclipticLongitude(datetime))

  // Get the Sun's mean ecliptic longitude:
  const l = radians(getSolarEclipticLongitude(datetime))

  // Get the avection correction:
  return 1.2739 * Math.sin(2 * (λ - l) - M)
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanEclipticLongitudeOfTheAscendingNode()
 *
 * The mean lunar ecliptic longitude of the ascending node is the angle where
 * the Moon's orbit crosses the ecliptic at the current epoch relative to J2000.
 *
 * @param date - The date to calculate the Moon's mean ecliptic longitude of the ascending node for.
 * @returns The Moon's mean ecliptic longitude of the ascending node at the given date.
 *
 */
export const getLunarMeanEclipticLongitudeOfTheAscendingNode = (datetime: Date): number => {
  // Get the number of days since the standard epoch J2000:
  const d = getJulianDate(datetime) - 2451545.0

  // Get the Moon's ecliptic longitude of the ascending node at the current epoch relative to J2000:
  let Ω = (125.044522 - 0.0529539 * d) % 360

  // Correct for negative angles
  if (Ω < 0) {
    Ω += 360
  }

  // Correct for the Sun's mean anomaly:
  const M = radians(getSolarMeanAnomaly(datetime))

  return Ω - 0.16 * Math.sin(M)
}

/*****************************************************************************************************************/
