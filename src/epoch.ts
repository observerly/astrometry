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
