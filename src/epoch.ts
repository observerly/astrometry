/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { utc } from './utc'

/*****************************************************************************************************************/

/**
 *
 * getJulianDate()
 *
 *
 * @param date - The date for which to calculate the Julian Date (JD).
 * @returns Julian Date as number - the Julian Date (JD) of the given date normalised to UTC.
 *
 */
export const getJulianDate = (datetime: Date): number => {
  const UTC = utc(datetime)

  // Return the Julian Date (JD) of the given date normalised to UTC.
  return UTC.getTime() / 86400000.0 + 2440587.5
}

/*****************************************************************************************************************/

/**
 *
 * getModifiedJulianDate()
 *
 *
 * @param date - The date for which to calculate the Modified Julian Date (MJD).
 * @returns Modified Julian Date as number - the Modified Julian Date (MJD) of the given date normalised to UTC.
 *
 */
export const getModifiedJulianDate = (datetime: Date): number => {
  return getJulianDate(datetime) - 2400000.5
}

/*****************************************************************************************************************/

/**
 *
 * getNumberOfCenturiesSinceJ2000()
 *
 * @param datetime - The date for which to calculate the number of centuries since J2000.0.
 * @returns number - the number of centuries since J2000.0.
 *
 */
export const getNumberOfCenturiesSinceJ2000 = (datetime: Date): number => {
  // Get the Julian Date (JD) of the given date normalised to UTC:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  return (JD - 2451545.0) / 36525
}

/*****************************************************************************************************************/
