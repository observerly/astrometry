/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/temporal
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type GeographicCoordinate } from './common'

/*****************************************************************************************************************/

/**
 *
 * convertLocalSiderealTimeToGreenwhichSiderealTime()
 *
 * Makes the conversion from Greenwich Sidereal Time to Local Sidereal Time.
 *
 * @param LST - a given Local Sidereal Time
 * @param observer - The geographic coordinate of the observer.
 * @returns GST - the Greenwich Sidereal Time for the given Local Sidereal Times
 *
 */
export const convertLocalSiderealTimeToGreenwhichSiderealTime = (
  LST: number,
  observer: GeographicCoordinate
): number => {
  const { longitude } = observer

  let GST = LST - longitude / 15.0

  if (GST < 0) {
    GST += 24
  }

  if (GST > 24) {
    GST -= 24
  }

  return GST
}

/*****************************************************************************************************************/
