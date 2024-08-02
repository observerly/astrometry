/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/twilight
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { GeographicCoordinate, Interval } from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getSolarEquatorialCoordinate } from './sun'

/*****************************************************************************************************************/

export enum Twilight {
  /**
   *
   * Night - The time when the sun is -18 degrees below the horizon.
   *
   */
  Night = 'Night',
  /**
   *
   * Astronomical - The time when the sun is between -12 and -18 degrees below the horizon.
   *
   */
  Astronomical = 'Astronomical',
  /**
   *
   * Nautical - The time when the sun is between -6 and -12 degrees below the horizon.
   *
   */
  Nautical = 'Nautical',
  /**
   *
   * Civil - The time when the sun is between 0 and -6 degrees below the horizon.
   *
   */
  Civil = 'Civil',
  /**
   *
   * Day - The time when the sun is above the horizon.
   *
   */
  Day = 'Day'
}

/*****************************************************************************************************************/

export type TwilightBand = {
  name: Twilight
  interval: Interval
}

/*****************************************************************************************************************/

const getWhatTwilight = (altitude: number) => {
  switch (true) {
    case altitude < -18:
      return Twilight.Night
    case altitude < -12:
      return Twilight.Astronomical
    case altitude < -6:
      return Twilight.Nautical
    case altitude < 0:
      return Twilight.Civil
    default:
      return Twilight.Day
  }
}

/*****************************************************************************************************************/

/**
 *
 * getTwilightBandsForDay()
 *
 * Returns the twilight bands for a given day, e.g., Night, Astronomical, Nautical, Civil, Day and their respective
 * intervals for a given observer (latitude and longitude) and datetime.
 *
 * @param datetime - The date and time for which to calculate the twilight bands
 * @param observer - The geographic coordinates of the observer
 * @param params - Optional parameters for the calculation
 * @returns An array of twilight bands for the given day
 */
export const getTwilightBandsForDay = (
  datetime: Date,
  observer: GeographicCoordinate,
  params: { stepSeconds?: number } = {
    stepSeconds: 10
  }
): TwilightBand[] => {
  const { stepSeconds = 10 } = params

  // Set the time to midnight:
  const midnight = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate())

  // Set the end time to midnight the next day:
  const end = new Date(midnight.getTime() + 86400000)

  // Copy of midnight to avoid modifying the original date:
  let from = new Date(midnight.getTime())

  const bands: TwilightBand[] = []

  // Get the solar equatorial coordinates for the target date:
  const sun = getSolarEquatorialCoordinate(from)

  // Get the altitude of the sun at midnight UTC:
  const { alt } = convertEquatorialToHorizontal(from, observer, sun)

  // Get the twilight band for the altitude of the sun at midnight UTC.
  // N.B. As we are in UTC timezone, the twilight band at midnight is
  // not necessarily Night.
  let twilight = getWhatTwilight(alt)

  // Start the first band at midnight:
  let start = new Date(from.getTime())

  // Loop through the day in steps of stepSeconds:
  while (from < end) {
    const sun = getSolarEquatorialCoordinate(from)

    const { alt } = convertEquatorialToHorizontal(from, observer, sun)

    const currentTwilight = getWhatTwilight(alt)

    if (currentTwilight !== twilight) {
      const to = new Date(from.getTime())

      bands.push({
        name: twilight,
        interval: {
          from: start,
          to
        }
      })

      twilight = currentTwilight
      start = to
    }

    // Add 1 seconds to the current time:
    from = new Date(from.getTime() + stepSeconds * 1000)
  }

  // Make sure the last band's end time is set to the end of the day:
  bands.push({
    name: twilight,
    interval: {
      from: start,
      to: end
    }
  })

  return bands
}

/*****************************************************************************************************************/
