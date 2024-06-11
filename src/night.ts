/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/night
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type GeographicCoordinate } from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getJulianDate } from './epoch'

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

  const ha = degrees(
    Math.acos(
      (Math.sin(radians(-0.833) - Math.sin(radians(latitude)) * Math.sin(radians(dec))) /
        Math.cos(radians(latitude))) *
        Math.cos(radians(dec))
    )
  )

  const Jr = Jt - ha / 360

  const Js = Jt + ha / 360

  return {
    sunrise: new Date((Jr - 2440587.5) * 86400 * 1000),
    noon: new Date((Jt - 2440587.5) * 86400 * 1000),
    sunset: new Date((Js - 2440587.5) * 86400 * 1000),
    J,
    ha
  }
}

/*****************************************************************************************************************/

export const getSolarTransit = (
  datetime: Date,
  observer: GeographicCoordinate,
  horizon: number = -12,
  temperature: number = 288.15,
  pressure: number = 101325
): {
  sunrise: Date | null
  noon: Date | null
  sunset: Date | null
} => {
  // Set the datetime to be at 1 minute before midnight for the previous date:
  datetime = new Date(new Date(datetime.setHours(0, 0, 0, 0)).getTime())

  // Get the generalized (approximated) solar transit for the date:
  const { sunrise, noon, sunset } = getGeneralizedSolarTransit(datetime, observer)

  // If the observer is in perpetual daylight or perpetual night, return null:
  if (sunrise === null || sunset === null) {
    return { sunrise: null, noon: null, sunset: null }
  }

  let rise: null | Date = null

  // Loop between +/- 2 hours of the generalized sunrise to find the accurate sunrise,
  // correcting for atmospheric refraction:
  for (let i = -120; i <= 120; i++) {
    const when = new Date(sunrise.getTime() + 60000 * i)

    const { ra, dec } = getSolarEquatorialCoordinate(when)

    const target = convertEquatorialToHorizontal(when, observer, {
      ra,
      dec
    })

    const refraction = getCorrectionToHorizontalForRefraction(target, temperature, pressure)

    // Find the altitude where the sun passes above the horizon:
    if (refraction.alt > horizon && rise === null) {
      rise = when
      break
    }
  }

  let set: null | Date = null

  // Loop between +/- 2 hours of the generalized sunset to find the accurate sunset,
  // correcting for atmospheric refraction:
  for (let i = -120; i <= 120; i++) {
    const when = new Date(sunset.getTime() + 60000 * i)

    const { ra, dec } = getSolarEquatorialCoordinate(when)

    const target = convertEquatorialToHorizontal(when, observer, {
      ra,
      dec
    })

    const refraction = getCorrectionToHorizontalForRefraction(target, temperature, pressure)

    // Find the altitude where the sun passes above the horizon:
    if (refraction.alt < horizon && set === null) {
      set = when
      break
    }
  }

  return { sunrise: rise || sunrise, noon, sunset: set || sunset }
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
  horizon: number = -12,
  temperature: number = 288.15,
  pressure: number = 101325
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
  horizon: number = -12,
  temperature: number = 288.15,
  pressure: number = 101325
): boolean => {
  const when = new Date(
    datetime.getFullYear(),
    datetime.getMonth(),
    datetime.getDate(),
    datetime.getHours(),
    datetime.getMinutes(),
    datetime.getSeconds(),
    datetime.getMilliseconds()
  )

  const { sunrise, sunset } = getSolarTransit(datetime, observer, horizon, temperature, pressure)

  if (sunrise === null || sunset === null) {
    return false
  }

  // If the datetime is before sunrise or after sunset, it is night:
  return when.getTime() <= sunrise.getTime() || when.getTime() >= sunset.getTime()
}

/*****************************************************************************************************************/
