/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate, getTerrestrialTime } from './epoch'

import { getNutation } from './nutation'

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
  // The polynomial is referred to Terrestrial Time, and so it is resolved at the Terrestrial Time of the given
  // date, as the nutation it is corrected by is:
  const JD = getJulianDate(getTerrestrialTime(datetime))

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

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

/**
 *
 * getTrueObliquityOfTheEcliptic()
 *
 * The true obliquity of the ecliptic is the mean obliquity of the ecliptic of the date corrected
 * for the nutation in obliquity, e.g., the angle between the ecliptic and the true celestial
 * equator of the date, about which a coordinate referred to the true equator and equinox of the
 * date is converted.
 *
 * @param date - The date for which to calculate the true obliquity of the ecliptic for.
 * @returns The true obliquity of the ecliptic in degrees.
 *
 */
export const getTrueObliquityOfTheEcliptic = (datetime: Date): number => {
  // Get the mean obliquity of the ecliptic (in degrees):
  const ε = getObliquityOfTheEcliptic(datetime)

  // Get the nutation in obliquity (in degrees):
  const { Δε } = getNutation(datetime)

  // Correct for the nutation in obliquity, e.g., the displacement of the true equator of the
  // date from the mean equator of the date (in degrees):
  return ε + Δε
}

/*****************************************************************************************************************/
