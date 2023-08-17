/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sun
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getJulianDate } from './epoch'

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
