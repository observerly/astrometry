/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sun
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getJulianDate } from './epoch'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getSolarMeanAnomaly()
 *
 * The Sun's mean anomaly is the angle between perigee and the Sun's current position.
 *
 * @param date - The date to calculate the Sun's mean anomaly for.
 * @returns The Sun's mean anomaly at the given date.
 *
 */
export const getSolarMeanAnomaly = (datetime: Date): number => {
  // Get the Julian Date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the Sun's mean anomaly at the current epoch relative to J2000:
  let M = (357.52911 + 35999.05029 * T - 0.0001537 * Math.pow(T, 2)) % 360

  if (M < 0) {
    M += 360
  }

  return M
}

/*****************************************************************************************************************/

/**
 *
 * getSolarEquationOfCenter()
 *
 * The equation of center is the difference between the mean geometric longitude
 * and the mean anomaly.
 *
 * @param datetime
 * @returns The Sun's equation of center at the given date.
 */
export const getSolarEquationOfCenter = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the mean anomaly:
  const M = getSolarMeanAnomaly(datetime)

  // Calculate the equation of center:
  const C =
    (1.914602 - 0.004817 * Math.pow(T, 2) - 0.000014 * Math.pow(T, 3)) * Math.sin(radians(M)) +
    (0.019993 - 0.000101 * Math.pow(T, 2)) * Math.sin(radians(2 * M)) +
    0.000289 * Math.sin(radians(3 * M))

  return C
}

/*****************************************************************************************************************/
