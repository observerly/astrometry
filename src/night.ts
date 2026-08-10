/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/night
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { GeographicCoordinate } from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getJulianDate } from './epoch'

import { getLocalHorizon } from './observer'

import { getCorrectionToHorizontalForRefraction } from './refraction'

import { getSolarEquatorialCoordinate } from './sun'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getGeneralizedSolarTransit()
 *
 * This is a lower accuracy method for calculating the transit of the Sun.
 *
 * Atmospheric conditions are not taken into account.
 *
 * @param datetime - The date to calculate the generalized solar transit for.
 * @param observer - The geographic coordinates of the observer.
 * @returns The generalized solar transit for the given date.
 *
 */
export const getGeneralizedSolarTransit = (
  datetime: Date,
  observer: GeographicCoordinate
): {
  sunrise: Date | null
  noon: Date | null
  sunset: Date | null
  J: number
  ha: number
} => {
  const { latitude, longitude } = observer

  // Get the Julian Date:
  const JD = getJulianDate(datetime)

  const n = Math.ceil(JD - (2451545.0 + 0.0009) + 69.184 / 86400.0)

  // Calculate the mean solar time, J*:
  const J = n - longitude / 360

  // Calculate the mean solar anomaly, M:
  const M = (357.5291 + 0.98560028 * J) % 360

  // Calculate the equation of the center, C:
  const C =
    1.9148 * Math.sin(radians(M)) +
    0.02 * Math.sin(radians(2 * M)) +
    0.0003 * Math.sin(radians(3 * M))

  const λ = (M + C + 180 + 102.9372) % 360

  const Jt = 2451545.0 + J + 0.0053 * Math.sin(radians(M)) - 0.0069 * Math.sin(radians(2 * λ))

  const dec = degrees(Math.asin(Math.sin(radians(λ)) * Math.sin(radians(23.45))))

  // The cosine of the hour angle of the Sun at the horizon:
  const cosha =
    (Math.sin(radians(-0.833)) - Math.sin(radians(latitude)) * Math.sin(radians(dec))) /
    (Math.cos(radians(latitude)) * Math.cos(radians(dec)))

  const noon = new Date((Jt - 2440587.5) * 86400 * 1000)

  // The Sun does not cross the horizon for an observer in perpetual daylight or in perpetual
  // night, e.g., at the poles, and so there is no sunrise or sunset for the date given:
  if (!Number.isFinite(cosha) || Math.abs(cosha) > 1) {
    return {
      sunrise: null,
      noon,
      sunset: null,
      J,
      ha: Number.NaN
    }
  }

  const ha = degrees(Math.acos(cosha))

  const Jr = Jt - ha / 360

  const Js = Jt + ha / 360

  return {
    sunrise: new Date((Jr - 2440587.5) * 86400 * 1000),
    noon,
    sunset: new Date((Js - 2440587.5) * 86400 * 1000),
    J,
    ha
  }
}

/*****************************************************************************************************************/

export const getSolarTransit = (
  datetime: Date,
  observer: GeographicCoordinate,
  horizon = -12,
  temperature = 288.15,
  pressure = 101325
): {
  sunrise: Date | null
  noon: Date | null
  sunset: Date | null
} => {
  // Set the datetime to be at midnight UTC for the date specified, taking a copy of the
  // datetime so as to not modify the date given by the caller, and deriving the day
  // boundary in UTC so as to be independent of the timezone of the host system:
  const midnight = new Date(
    Date.UTC(datetime.getUTCFullYear(), datetime.getUTCMonth(), datetime.getUTCDate(), 0, 0, 0, 0)
  )

  // The transit of the Sun, e.g., local noon, which does not depend on the horizon:
  const { noon } = getGeneralizedSolarTransit(midnight, observer)

  if (!noon) {
    return { sunrise: null, noon: null, sunset: null }
  }

  // The altitude the events are resolved at, e.g., the horizon given by the caller, depressed
  // below the astronomical horizon by the elevation of the observer:
  const h = horizon - getLocalHorizon(observer.elevation ?? 0)

  // The apparent altitude of the Sun, e.g., its true altitude corrected for refraction, which
  // vanishes for an altitude below -1° and so does not perturb a twilight horizon:
  const altitude = (when: Date): number => {
    const target = convertEquatorialToHorizontal(when, observer, getSolarEquatorialCoordinate(when))

    return getCorrectionToHorizontalForRefraction(target, temperature, pressure).alt
  }

  // The generalized transit is an explicitly lower accuracy estimate, and so the culminations are
  // refined against the apparent altitude itself, by a ternary search about the estimate, within
  // which the altitude is unimodal. The estimate is otherwise up to ~2 minutes from the true
  // culmination, and so an event shorter than twice that, e.g., a grazing rise at the boundary of
  // the polar day, could be rejected from an altitude sampled on the wrong side of the horizon:
  const culmination = (estimate: number, highest: boolean): number => {
    let lower = estimate - 40 * 60000

    let upper = estimate + 40 * 60000

    while (upper - lower > 1000) {
      const first = lower + (upper - lower) / 3

      const second = upper - (upper - lower) / 3

      const closer = highest
        ? altitude(new Date(first)) > altitude(new Date(second))
        : altitude(new Date(first)) < altitude(new Date(second))

      if (closer) {
        upper = second
      } else {
        lower = first
      }
    }

    return (lower + upper) / 2
  }

  // The upper culmination, at which the apparent altitude of the Sun is at its maximum:
  const transit = culmination(noon.getTime(), true)

  // The apparent altitude of the Sun is at its maximum at the upper culmination, at its minimum
  // at the lower culmination half a solar day to either side, and is monotonic between the two,
  // and so it crosses the horizon exactly once in that interval where the horizon lies between
  // them.
  //
  // N.B. Whether the horizon is reachable is decided from the same apparent altitude the crossing
  // is resolved against, and not from the geometric hour angle: the refraction lifts the Sun by
  // up to ~0.5°, and so, near the boundary of the polar day, the Sun crosses the horizon
  // apparently while remaining below it geometrically:
  const crossing = (rise: boolean): Date | null => {
    // The end of the interval at which the Sun is at its lowest, e.g., the lower culmination
    // before the transit for the rise, and the one after it for the set:
    let below = culmination(transit + (rise ? -12 : 12) * 3600000, false)

    let above = transit

    // The conditions are negated so that an altitude that is not a number does not resolve to a
    // crossing:
    if (!(altitude(new Date(below)) < h) || !(altitude(new Date(above)) > h)) {
      return null
    }

    while (Math.abs(above - below) > 100) {
      const middle = (above + below) / 2

      if (altitude(new Date(middle)) < h) {
        below = middle
      } else {
        above = middle
      }
    }

    return new Date((above + below) / 2)
  }

  const sunrise = crossing(true)

  const sunset = crossing(false)

  // The Sun does not cross the horizon for an observer in perpetual daylight or perpetual night:
  if (sunrise === null || sunset === null) {
    return { sunrise: null, noon: null, sunset: null }
  }

  return { sunrise, noon, sunset }
}

/*****************************************************************************************************************/

/**
 *
 * getNight()
 *
 * Calculates the start and end of the next night for the observer at the given date.
 *
 * @param date - The date to calculate the extent of the next night for.
 * @param observer - The geographic coordinates of the observer.
 * @param horizon - The horizon altitude to use for the calculation.
 * @param temperature - The temperature to use for the calculation.
 * @param pressure - The pressure to use for the calculation.
 * @returns The start and end of the next night for the observer.
 *
 */
export const getNight = (
  datetime: Date,
  observer: GeographicCoordinate,
  horizon = -12,
  temperature = 288.15,
  pressure = 101325
): {
  start: Date | null
  end: Date | null
} => {
  const { sunset } = getSolarTransit(datetime, observer, horizon, temperature, pressure)

  const { sunrise } = getSolarTransit(
    new Date(datetime.getTime() + 60000 * 60 * 24),
    observer,
    horizon,
    temperature,
    pressure
  )

  // The observer could be in perpetual daylight or perpetual night, e.g., the North Pole or South Pole:
  return {
    start: sunset,
    end: sunrise
  }
}

/*****************************************************************************************************************/

export const isNight = (
  datetime: Date,
  observer: GeographicCoordinate,
  horizon = -12,
  temperature = 288.15,
  pressure = 101325
): boolean => {
  // The altitude the night is resolved at, e.g., the horizon given by the caller, depressed
  // below the astronomical horizon by the elevation of the observer:
  const h = horizon - getLocalHorizon(observer.elevation ?? 0)

  // The apparent altitude of the Sun at the time of observation:
  const target = convertEquatorialToHorizontal(
    datetime,
    observer,
    getSolarEquatorialCoordinate(datetime)
  )

  const { alt } = getCorrectionToHorizontalForRefraction(target, temperature, pressure)

  // It is night where the Sun is below the horizon at the time of observation. The altitude is
  // compared directly, rather than the time against a sunrise and a sunset, which do not exist
  // for an observer in perpetual daylight or in perpetual night, e.g., it is night all day for
  // an observer in polar night, for whom there is no sunrise to compare against:
  return alt < h
}

/*****************************************************************************************************************/
