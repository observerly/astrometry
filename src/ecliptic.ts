/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate } from './epoch'

import { getSolarEquatorialCoordinate } from './sun'

/*****************************************************************************************************************/

/**
 *
 * getEclipticPlane()
 *
 * @param date - The date to calculate the ecliptic plane for.
 * @returns The ecliptic plane at the given date.
 *
 */
export const getEclipticPlane = (date: Date): EquatorialCoordinate[] => {
  const ecliptic = [] as EquatorialCoordinate[]

  // Get the current year start date, deriving the year boundary in UTC so as to be independent of
  // the timezone of the host system:
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0))

  // Get the current year end date:
  const end = new Date(Date.UTC(date.getUTCFullYear() + 1, 0, 1, 0, 0, 0, 0))

  // Loop over all days between the start and end dates, taking a copy of the start date so as to
  // not modify it:
  for (const day = new Date(start.getTime()); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    ecliptic.push(getSolarEquatorialCoordinate(day))
  }

  return ecliptic
}

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
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Calculate the obliquity of the ecliptic:
  return 23.439292 - (46.845 * T + 0.00059 * T ** 2 + 0.001813 * T ** 3) / 3600
}

/*****************************************************************************************************************/
