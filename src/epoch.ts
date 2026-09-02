/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { LEAP_SECONDS } from './iers'

import { utc } from './utc'

/*****************************************************************************************************************/

/**
 *
 * getJulianDate()
 *
 *
 * @param date - The date for which to calculate the Julian Date (JD).
 * @returns Julian Date as number - the Julian Date (JD) of the given date normalised to UTC.
 *
 */
export const getJulianDate = (datetime: Date): number => {
  const UTC = utc(datetime)

  // Return the Julian Date (JD) of the given date normalised to UTC.
  return UTC.getTime() / 86400000.0 + 2440587.5
}

/*****************************************************************************************************************/

/**
 *
 * getModifiedJulianDate()
 *
 *
 * @param date - The date for which to calculate the Modified Julian Date (MJD).
 * @returns Modified Julian Date as number - the Modified Julian Date (MJD) of the given date normalised to UTC.
 *
 */
export const getModifiedJulianDate = (datetime: Date): number => {
  return getJulianDate(datetime) - 2400000.5
}

/*****************************************************************************************************************/

/**
 *
 * getNumberOfCenturiesSinceJ2000()
 *
 * @param datetime - The date for which to calculate the number of centuries since J2000.0.
 * @returns number - the number of centuries since J2000.0.
 *
 */
export const getNumberOfCenturiesSinceJ2000 = (datetime: Date): number => {
  // Get the Julian Date (JD) of the given date normalised to UTC:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  return (JD - 2451545.0) / 36525
}

/*****************************************************************************************************************/

/**
 *
 * getInternationalAtomicTime()
 *
 * The International Atomic Time (TAI) is the continuous time scale of the highly precise atomic
 * clocks worldwide, e.g., the civil time of the given date displaced by the leap seconds that
 * have been added to the UTC time scale to keep it within 0.9 seconds of the rotation of the
 * Earth. The difference between the two, e.g., DTAI, is drawn from the leap seconds published
 * by the International Earth Rotation and Reference Systems Service (IERS).
 *
 * N.B. The leap seconds are defined from the 1st January 1972, and so a date before the first
 * of them is returned as it is.
 *
 * @param datetime - The date to resolve the International Atomic Time (TAI) for.
 * @returns The International Atomic Time (TAI) of the given date.
 *
 */
export const getInternationalAtomicTime = (datetime: Date): Date => {
  const when = datetime.getTime()

  // The difference between TAI and UTC, e.g., the number of leap seconds that have been added
  // to the UTC time scale at the given date (in seconds):
  let dtai = 0

  // The leap seconds are ordered by time, and so the difference is that of the last of them at
  // or before the given date:
  for (const { unix, dtai: seconds } of LEAP_SECONDS) {
    if (when >= unix) {
      dtai = seconds
    } else {
      break
    }
  }

  return new Date(when + dtai * 1000)
}

/*****************************************************************************************************************/

/**
 *
 * getTerrestrialTime()
 *
 * The Terrestrial Time (TT) is the uniform time scale the ephemerides of the Sun, the Moon and
 * the planets are referred to, e.g., the International Atomic Time (TAI) of the given date
 * displaced by the constant 32.184 seconds that carries the atomic time scale onto the older
 * ephemeris time scale it succeeded.
 *
 * @param datetime - The date to resolve the Terrestrial Time (TT) for.
 * @returns The Terrestrial Time (TT) of the given date.
 *
 */
export const getTerrestrialTime = (datetime: Date): Date => {
  return new Date(getInternationalAtomicTime(datetime).getTime() + 32184)
}

/*****************************************************************************************************************/
