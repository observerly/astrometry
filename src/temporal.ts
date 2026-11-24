/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/temporal
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { GeographicCoordinate } from './common'

import { J1970, J2000 } from './constants'

import { getJulianDate } from './epoch'

/*****************************************************************************************************************/

/**
 *
 * convertJulianDateToUTC()
 *
 * @param JD - the Julian Date to convert to UTC
 * @returns Date - the UTC date from the Julian Date
 *
 */
export function convertJulianDateToUTC(JD: number): Date {
  // Return the UTC date from the Julian Date, rounded to the nearest millisecond. A Julian Date resolves to
  // roughly 0.04 ms as a double, and the Date constructor truncates a fractional time value towards zero:
  return new Date(Math.round((JD - J1970) * 86400000))
}

/*****************************************************************************************************************/

/**
 *
 * convertLocalSiderealTimeToGreenwichSiderealTime()
 *
 * Makes the conversion from Greenwich Sidereal Time to Local Sidereal Time.
 *
 * @param LST - a given Local Sidereal Time
 * @param observer - The geographic coordinate of the observer.
 * @returns GST - the Greenwich Sidereal Time for the given Local Sidereal Times
 *
 */
export function convertLocalSiderealTimeToGreenwichSiderealTime(
  LST: number,
  observer: GeographicCoordinate
): number {
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

/**
 *
 * convertGreenwichSiderealTimeToUniversalTime()
 *
 * Makes the conversion from Greenwich Sidereal Time to Universal Coordinated Time.
 *
 * @param date - The datetime object to convert.
 * @param GST - The Greenwich Sidereal Time (GST) to convert.
 * @returns UTC - The Universal Coordinated Time (UTC) of the given date normalised to UTC.
 *
 */
export function convertGreenwichSiderealTimeToUniversalTime(GST: number, date: Date): Date {
  // Get the Julian Date at 0h UTC:
  const JD = getJulianDate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
  )

  // Get the number of centuries since J2000.0 of 0h UTC:
  const T = (JD - J2000) / 36525.0

  // Calculate the Greenwich Sidereal Time (GST) at 0h UT, e.g., the same polynomial as the forward
  // conversion of getGreenwichSiderealTime(), so that the one is the exact inverse of the other:
  let T_0 = (6.697374558 + 2400.051336 * T + 0.000025862 * T ** 2) % 24

  if (T_0 < 0) {
    T_0 += 24
  }

  let A = (GST - T_0) % 24

  // Correct for negative hour angles
  if (A < 0) {
    A += 24
  }

  // The sidereal interval since 0h UT, converted to the mean solar interval:
  const UTC = A / 1.002737909

  // Convert decimal hours to hours, minutes and seconds:
  const hours = Math.floor(UTC)

  const minutes = Math.floor((UTC - hours) * 60)

  const seconds = Math.floor(((UTC - hours) * 60 - minutes) * 60)

  const milliseconds = Math.floor((((UTC - hours) * 60 - minutes) * 60 - seconds) * 1000)

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      seconds,
      milliseconds
    )
  )
}

/*****************************************************************************************************************/
