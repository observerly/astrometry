/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constants
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { getJulianDate, getModifiedJulianDate } from './epoch'

import { LEAP_SECONDS } from './iers'

import { getHeliocentricJulianDate } from './sun'

/*****************************************************************************************************************/

// This is the number of milliseconds to correct for a given zeroth date according to the IERS table.
const applyDTAICorrectionToDateTime = (datetime: number, zero: number): number => {
  let correction = 0

  let dtai = 0

  // Iterate over the leap seconds table
  for (let i = 0; i < LEAP_SECONDS.length; i++) {
    // Update the correction if the zeroth date timestamp is after the current leap second
    if (zero > LEAP_SECONDS[i].unix) {
      correction = LEAP_SECONDS[i].dtai
    }

    // Update the dtai if the datetime is after or equal to the current leap second
    if (datetime >= LEAP_SECONDS[i].unix) {
      dtai = LEAP_SECONDS[i].dtai
    } else {
      // Since the leap seconds are ordered by time, we can break early
      break
    }
  }

  return dtai - correction
}

/*****************************************************************************************************************/

export class DateTime extends Date {
  /**
   *
   * @returns the International Atomic Time (TAI) of the given date.
   *
   */
  getInternationalAtomicTime(): number {
    const zero = new Date('1972-01-01T00:00:00.000+00:00').getTime()
    // The International Atomic Time (TAI) is the time scale that combines the output of
    // some 400 highly precise atomic clocks worldwide, and provides the exact speed of our
    // clocks, which is essential for the accurate positioning of satellites and for many
    // other applications.
    let dtai = 0

    const d = super.getTime()

    // If the date is before the first leap second was added, return the date.
    if (d < zero) return d

    // Iterate backwards over the leap seconds table to find the current number of leap seconds.
    dtai = applyDTAICorrectionToDateTime(d, zero)

    // The difference between TAI and UTC is the number of leap seconds that have been
    // added to the UTC time scale. This difference is known as DTAI.
    return d + dtai * 1000
  }

  /**
   *
   * @returns the International Atomic Time (TAI) of the given date.
   *
   */
  getTAI(): number {
    return this.getInternationalAtomicTime()
  }

  /**
   *
   * @returns the Terrestrial Time (TT) of the given date.
   *
   */
  getTerrestrialTime(): number {
    const tai = this.getInternationalAtomicTime()

    // The difference between TAI and TT is the number of leap seconds that have been
    // added to the UTC time scale. This difference is known as DTAI.
    return tai + 32.184 * 1000
  }

  /**
   *
   * @returns the Terrestrial Time (TT) of the given date.
   *
   */
  getTT(): number {
    return this.getTerrestrialTime()
  }

  getGlobalPositioningSystemTime(): number {
    const zero = new Date('1980-01-06T00:00:00.000+00:00').getTime()
    // The International Atomic Time (TAI) is the time scale that combines the output of
    // some 400 highly precise atomic clocks worldwide, and provides the exact speed of our
    // clocks, which is essential for the accurate positioning of satellites and for many
    // other applications.
    let dtai = 0

    const d = super.getTime()

    // If the date is before the first leap second was added, return the date.
    if (d < zero) return d

    // Iterate backwards over the leap seconds table to find the current number of leap seconds.
    dtai = applyDTAICorrectionToDateTime(d, zero)

    // The difference between TAI and UTC is the number of leap seconds that have been
    // added to the UTC time scale. This difference is known as DTAI.
    return d + dtai * 1000
  }

  getGPS(): number {
    return this.getGlobalPositioningSystemTime()
  }

  /**
   *
   *
   * @returns Julian Date as number - the Julian Date (JD) of the given date.
   *
   */
  getJulianDate(): number {
    return getJulianDate(this)
  }

  /**
   *
   *
   * @returns Julian Date as number - the Julian Date (JD) of the given date.
   *
   */
  getJD(): number {
    return this.getJulianDate()
  }

  /**
   *
   *
   * @returns Modified Julian Date as number - the Modified Julian Date (MJD) of the given date.
   *
   */
  getModifiedJulianDate(): number {
    return getModifiedJulianDate(this)
  }

  /**
   *
   *
   * @returns Modified Julian Date as number - the Modified Julian Date (MJD) of the given date.
   *
   */
  getMJD(): number {
    return this.getModifiedJulianDate()
  }

  /**
   *
   *
   * @returns Heliocentric Julian Date as number - the Heliocentric Julian Date (HJD) of the given date.
   *
   */
  getHeliocentricJulianDate(): number {
    return getHeliocentricJulianDate(this)
  }

  /**
   *
   *
   * @returns Heliocentric Julian Date as number - the Heliocentric Julian Date (HJD) of the given date.
   *
   */
  getHJD(): number {
    return this.getHeliocentricJulianDate()
  }
}

/*****************************************************************************************************************/
