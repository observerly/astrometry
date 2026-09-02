/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate } from './epoch'

import { getSolarEquatorialCoordinate, getSolarMeanGeometricLongitude } from './sun'

import { convertDegreesToRadians as radians } from './utilities'

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
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the mean obliquity of the ecliptic (in degrees):
  const ε = getObliquityOfTheEcliptic(datetime)

  // Get the ecliptic longitude of the ascending node of the Moon (in degrees):
  //
  // N.B. The polynomial is that of getLunarMeanEclipticLongitudeOfTheAscendingNode(), which is
  // resolved here so that this module does not depend on the moon module, which depends on this
  // module:
  const Ω = (125.044522 - 0.0529539 * (JD - 2451545.0)) % 360

  // Get the mean geometric longitude of the Sun (in degrees):
  const LS = getSolarMeanGeometricLongitude(datetime)

  // Get the mean geometric longitude of the Moon (in degrees), resolved here likewise:
  const LM =
    (218.3164477 + 481267.88123421 * T - 0.0015786 * T ** 2 + T ** 3 / 538841 - T ** 4 / 65194000) %
    360

  // Correct for the nutation in obliquity, e.g., the displacement of the true equator of the
  // date from the mean equator of the date (in degrees):
  return (
    ε +
    (9.2 * Math.cos(radians(Ω)) +
      0.57 * Math.cos(radians(2 * LS)) +
      0.1 * Math.cos(radians(2 * LM)) -
      0.09 * Math.cos(radians(2 * Ω))) /
      3600
  )
}

/*****************************************************************************************************************/
