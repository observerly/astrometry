/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getNumberOfCenturiesSinceJ2000, getTerrestrialTime } from './epoch'

/*****************************************************************************************************************/

/**
 *
 * getObliquityOfTheEcliptic()
 *
 * The obliquity of the ecliptic is the angle between the ecliptic and the celestial
 * equator, and is used to convert between ecliptic and equatorial coordinates.
 *
 * @param date - The date for which to calculate the obliquity of the ecliptic for.
 * @returns The obliquity of the ecliptic in degrees.
 *
 */
export const getObliquityOfTheEcliptic = (datetime: Date): number => {
  // The polynomial is referred to Terrestrial Time, and so it is resolved at the Terrestrial Time of the given
  // date, as the nutation it is corrected by is:
  const tt = getTerrestrialTime(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = getNumberOfCenturiesSinceJ2000(tt)

  // Calculate the obliquity of the ecliptic, e.g., the mean obliquity of IAU 2006, converted from arcseconds to
  // degrees:
  return (
    (84381.406 -
      46.836769 * T -
      0.0001831 * T ** 2 +
      0.0020034 * T ** 3 -
      0.000000576 * T ** 4 -
      0.0000000434 * T ** 5) /
    3600
  )
}

/*****************************************************************************************************************/
