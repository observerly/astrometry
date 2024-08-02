/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/temporal
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { J1970 } from './constants'

import type { GeographicCoordinate } from './common'

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
export const convertJulianDateToUTC = (JD: number): Date => {
  // Return the UTC date from the Julian Date:
  return new Date((JD - J1970) * 86400000)
}

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

/**
 *
 * convertGreenwhichSiderealTimeToUniversalTime()
 *
 * Makes the conversion from Greenwich Sidereal Time to Universal Coordinated Time.
 *
 * @param date - The datetime object to convert.
 * @param GST - The Greenwich Sidereal Time (GST) to convert.
 * @returns UTC - The Universal Coordinated Time (UTC) of the given date normalised to UTC.
 *
 */
export const convertGreenwhichSiderealTimeToUniversalTime = (GST: number, date: Date): Date => {
  // Adjust the date to UTC:
  date = new Date(date.getTime() + date.getTimezoneOffset() * 60000)

  // Get the Julian Date at 0h:
  const JD = getJulianDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
  )

  // Get the Julian Date at 0h on 1st January for the current year:
  const JD_0 = getJulianDate(new Date(Date.UTC(date.getFullYear(), 1, 1, 0, 0, 0, 0))) - 1

  // Get the number of Julian days since 1st January for the current year:
  const d = JD - JD_0

  // Calculate the number of centuries since J1900.0 and JD_0:
  const T = (JD_0 - 2415020.0) / 36525

  const R = 6.6460656 + 2400.051262 * T + 0.00002581 * T ** 2

  const B = 24 - R + 24 * (date.getFullYear() - 1900)

  let T_0 = 0.0657098 * d - B

  if (T_0 < 0) {
    T_0 += 24
  }

  if (T_0 > 24) {
    T_0 -= 24
  }

  let A = GST - T_0

  // Correct for negative hour angles
  if (A < 0) {
    A += 24
  }

  const UTC = 0.99727 * A

  // Convert decimal hours to hours, minutes and seconds:
  const hours = Math.floor(UTC)

  const minutes = Math.floor((UTC - hours) * 60)

  const seconds = Math.floor(((UTC - hours) * 60 - minutes) * 60)

  const milliseconds = Math.floor((((UTC - hours) * 60 - minutes) * 60 - seconds) * 1000)

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    seconds,
    milliseconds
  )
}

/*****************************************************************************************************************/
