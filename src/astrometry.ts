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
  // Get the Julian Date of the given date:
  const JD = getJulianDate(datetime)

  // Get the Julian Date of the previous midnight:
  const JD_0 = Math.floor(JD - 0.5) + 0.5

  // Get the number of days since the previous midnight:
  const S = JD_0 - 2451545.0

  // Get the number of centuries since J2000.0:
  const T = S / 36525.0

  // Calculate the Greenwich Sidereal Time (GST) at 0h UT:
  let T_0 = (6.697374558 + 2400.051336 * T + 0.000025862 * Math.pow(T, 2)) % 24

  // Ensure that the Greenwich Sidereal Time (GST) is positive:
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

/**
 *
 * getLocalSiderealTime()
 *
 * The Local Sidereal Time (LST) is the hour angle of the vernal
 * equinox, the ascending node of the ecliptic on the celestial equator.
 *
 * @param date - The date for which to calculate the Local Sidereal Time (LST).
 * @param longitude - The longitude of the observer in degrees.
 * @returs Local Sidereal Time as number - the Local Sidereal Time (LST) of the given date normalised to UTC.
 *
 */
export const getLocalSiderealTime = (datetime: Date, longitude: number): number => {
  // Get the Greenwich Sidereal Time (GST) of the given date:
  const GST = getGreenwhichSiderealTime(datetime)

  let d = (GST + longitude / 15.0) / 24.0

  d = d - Math.floor(d)

  if (d < 0) {
    d += 1
  }

  return 24.0 * d
}

/*****************************************************************************************************************/

/**
 *
 * @alias getLocalSiderealTime()
 *
 */
export const LST = getLocalSiderealTime

/*****************************************************************************************************************/
