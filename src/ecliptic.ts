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

  // Get the current year start date:
  const start = new Date(date.getFullYear(), 0, 1)

  // Get the current year end date:
  const end = new Date(date.getFullYear() + 1, 0, 1)

  // Loop over all days between the start and end dates:
  for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
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
