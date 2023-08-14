/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/astrometry
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getJulianDate } from './epoch'

import { utc } from './utc'

/*****************************************************************************************************************/

/**
 *
 * getGreenwhichSiderealTime()
 *
 * The Greenwich Sidereal Time (GST) is the hour angle of the vernal
 * equinox, the ascending node of the ecliptic on the celestial equator.
 *
 * @param date - The date for which to calculate the Greenwich Sidereal Time (GST).
 * @returns Greenwich Sidereal Time as number - the Greenwich Sidereal Time (GST) of the given date normalised to UTC.
 *
 */
export const getGreenwhichSiderealTime = (datetime: Date): number => {
  const JD = getJulianDate(datetime)

  const JD_0 = Math.floor(JD - 0.5) + 0.5

  const S = JD_0 - 2451545.0

  const T = S / 36525.0

  let T_0 = (6.697374558 + 2400.051336 * T + 0.000025862 * Math.pow(T, 2)) % 24

  if (T_0 < 0) {
    T_0 += 24
  }

  // Ensure that the date is in UTC
  const d = utc(datetime)

  // Convert the UTC time to a decimal fraction of hours:
  const UTC =
    d.getUTCMilliseconds() / 1e-6 +
    d.getUTCSeconds() / 60 +
    d.getUTCMinutes() / 60 +
    d.getUTCHours()

  const A = UTC * 1.002737909

  T_0 += A

  let GST = T_0 + A

  GST = GST % 24

  return GST < 0 ? GST + 24 : GST
}

/*****************************************************************************************************************/

/**
 *
 * @alias getGreenwhichSiderealTime()
 *
 */
export const GST = getGreenwhichSiderealTime

/*****************************************************************************************************************/
